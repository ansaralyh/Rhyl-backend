const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const { category, search, featured, inStock, minPrice, maxPrice, page = 1, limit = 20, sort = '-createdAt' } = req.query;

        // Build query
        let query = {};

        if (category) {
            query.category = category;
        }

        if (featured) {
            query.featured = featured === 'true';
        }

        if (search) {
            query.$text = { $search: search };
        }

        if (inStock === 'true') {
            query.stock = { $gt: 0 };
        } else if (inStock === 'false') {
            query.stock = 0;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Execute query with pagination
        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            count: products.length,
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name slug');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Bulk create products (from CSV/JSON)
// @route   POST /api/products/bulk
// @access  Private/Admin
exports.bulkCreateProducts = async (req, res) => {
    try {
        const { products: rawProducts } = req.body;
        if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Request body must include a non-empty "products" array'
            });
        }

        const categories = await Category.find({}).select('_id name').lean();
        const categoryByName = {};
        categories.forEach(c => {
            categoryByName[c.name.toLowerCase().trim()] = c._id.toString();
        });
        const firstCategoryId = categories.length > 0 ? categories[0]._id.toString() : null;

        const created = [];
        const errors = [];

        // 1. Validate all rows and prepare robust insert data
        const validProducts = [];

        for (let i = 0; i < rawProducts.length; i++) {
            const row = rawProducts[i];
            const rowNum = i + 1;
            try {
                const name = (row.name || row.productTitle || row.title || row['Product Title'] || '').toString().trim();
                if (!name) {
                    errors.push({ row: rowNum, message: 'Product title is required' });
                    continue;
                }

                const categoryName = (row.category || row.categories || row.Categories || row.Category || '').toString().trim();
                let categoryId = categoryName ? categoryByName[categoryName.toLowerCase()] : null;
                if (!categoryId) {
                    categoryId = firstCategoryId;
                }
                if (!categoryId) {
                    errors.push({ row: rowNum, message: 'No category in CSV and no categories exist in database. Create a category first.' });
                    continue;
                }

                const prevRaw = row.previousPrice ?? row.previous_price ?? row['Previous Price (£)'] ?? 0;
                const currRaw = row.currentPrice ?? row.current_price ?? row['Current Price (£)'] ?? prevRaw;
                const previousPrice = Math.max(0, parseFloat(String(prevRaw).replace(/[£$,]/g, '')) || 0);
                let currentPrice = Math.max(0, parseFloat(String(currRaw).replace(/[£$,]/g, '')));
                if (isNaN(currentPrice) || currentPrice === 0) currentPrice = previousPrice;
                const discount = previousPrice > 0
                    ? Math.max(0, Math.min(100, Math.round((1 - currentPrice / previousPrice) * 100)))
                    : 0;

                let imageUrls = row.imageUrls || row.image_urls || row['Product Images'] || row['Image URLs'] || row['Image URLs (multiple, separated by commas)'] || row.images || row.image;
                if (typeof imageUrls === 'string') {
                    imageUrls = imageUrls.split(',').map(s => s.trim()).filter(Boolean);
                }
                if (!Array.isArray(imageUrls)) imageUrls = [];
                if (imageUrls.length === 0) imageUrls.push('https://via.placeholder.com/300x310');

                const featuredVal = row.featured ?? row['Featured Product (Yes/No)'];
                const featured = /^(1|true|yes)$/i.test(String(featuredVal).trim());

                const productData = {
                    _id: new mongoose.Types.ObjectId(),
                    name,
                    description: (row.description || row.productDescription || row['Product Description'] || '').toString().trim(),
                    price: currentPrice || previousPrice,
                    previousPrice: previousPrice,
                    currentPrice: currentPrice || previousPrice,
                    discount,
                    category: [categoryId],
                    image: imageUrls[0],
                    images: imageUrls,
                    stock: Math.max(0, parseInt(row.stock ?? row.stockQuantity ?? row['Stock Quantity'], 10) || 0),
                    featured
                };

                validProducts.push({ rowNum, productData });
            } catch (err) {
                errors.push({ row: rowNum, message: err.message || 'Failed to parse product data' });
            }
        }

        // 2. Perform chunked inserts
        const BATCH_SIZE = 100;
        for (let i = 0; i < validProducts.length; i += BATCH_SIZE) {
            const batch = validProducts.slice(i, i + BATCH_SIZE);
            const docsToInsert = batch.map(b => b.productData);

            try {
                const insertedDocs = await Product.insertMany(docsToInsert, { ordered: false });
                insertedDocs.forEach((doc) => {
                    const original = batch.find(b => b.productData._id.toString() === doc._id.toString());
                    const rowNum = original ? original.rowNum : 'unknown';
                    created.push({ row: rowNum, id: doc._id, name: doc.name });
                });
            } catch (err) {
                if (err.insertedDocs && Array.isArray(err.insertedDocs)) {
                    err.insertedDocs.forEach(doc => {
                        const original = batch.find(b => b.productData._id.toString() === doc._id.toString());
                        const rowNum = original ? original.rowNum : 'unknown';
                        created.push({ row: rowNum, id: doc._id, name: doc.name });
                    });
                }

                if (err.writeErrors && Array.isArray(err.writeErrors)) {
                    err.writeErrors.forEach(writeError => {
                        const original = batch[writeError.index];
                        const rowNum = original ? original.rowNum : 'unknown';
                        errors.push({ row: rowNum, message: writeError.errmsg || writeError.message || 'Failed to insert product' });
                    });
                } else if (!err.insertedDocs) {
                    batch.forEach(b => {
                        errors.push({ row: b.rowNum, message: err.message || 'Failed to insert batch' });
                    });
                }
            }
        }

        res.status(200).json({
            success: true,
            created: created.length,
            failed: errors.length,
            total: rawProducts.length,
            createdIds: created.map(c => c.id),
            errors: errors.length ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        const body = { ...req.body };
        const price = Math.max(0, parseFloat(body.price) || 0);
        const previousPrice = Math.max(0, parseFloat(body.previousPrice) || price || 0);
        const currentPrice = Math.max(0, parseFloat(body.currentPrice) || price || 0);
        body.price = currentPrice || previousPrice || price;
        body.previousPrice = previousPrice;
        body.currentPrice = currentPrice || previousPrice;
        const product = await Product.create(body);

        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        const body = { ...req.body };
        const prevNum = parseFloat(body.previousPrice);
        const currNum = parseFloat(body.currentPrice);
        const priceNum = parseFloat(body.price);
        if (!isNaN(prevNum) || !isNaN(currNum) || !isNaN(priceNum)) {
            const existingProduct = await Product.findById(req.params.id);
            if (existingProduct) {
                const newCurrentPrice = !isNaN(currNum) ? Math.max(0, currNum) : (!isNaN(priceNum) ? Math.max(0, priceNum) : existingProduct.currentPrice);

                if (newCurrentPrice !== existingProduct.currentPrice) {
                    // Shift old currentPrice to previousPrice
                    body.previousPrice = existingProduct.currentPrice;
                    body.currentPrice = newCurrentPrice;
                    body.price = newCurrentPrice; // Keep legacy field in sync
                } else {
                    // Manual update of previousPrice or no change
                    body.previousPrice = !isNaN(prevNum) ? Math.max(0, prevNum) : existingProduct.previousPrice;
                    body.currentPrice = existingProduct.currentPrice;
                    body.price = existingProduct.price;
                }
            }
        }
        const product = await Product.findByIdAndUpdate(req.params.id, body, {
            new: true,
            runValidators: true
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
