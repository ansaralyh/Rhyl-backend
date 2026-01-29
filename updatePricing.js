const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const updateProductPricing = async () => {
    try {
        await connectDB();

        // Get all products
        const products = await Product.find();

        console.log(`Found ${products.length} products`);

        // Update each product with pricing data
        for (const product of products) {
            const currentPrice = product.price;
            const discountPercentage = 20; // 20% discount
            const originalPrice = Math.round(currentPrice / (1 - discountPercentage / 100));

            await Product.findByIdAndUpdate(product._id, {
                original_price: originalPrice,
                discount_percentage: discountPercentage,
                final_price: currentPrice,
                currency: 'GBP'
            });

            console.log(`Updated ${product.name}: Original £${originalPrice}, Discount ${discountPercentage}%, Final £${currentPrice}`);
        }

        console.log('All products updated with pricing information!');
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

updateProductPricing();
