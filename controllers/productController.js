const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const { category, search, featured, page = 1, limit = 20, sort = '-createdAt' } = req.query;

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

                const product = await Product.create(productData);
                created.push({ row: rowNum, id: product._id, name: product.name });
            } catch (err) {
                errors.push({ row: rowNum, message: err.message || 'Failed to create product' });
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
            body.previousPrice = !isNaN(prevNum) ? Math.max(0, prevNum) : (body.previousPrice != null ? body.previousPrice : 0);
            body.currentPrice = !isNaN(currNum) ? Math.max(0, currNum) : (body.currentPrice != null ? body.currentPrice : (body.previousPrice || priceNum || 0));
            body.price = body.currentPrice || (!isNaN(priceNum) ? Math.max(0, priceNum) : body.price);
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
