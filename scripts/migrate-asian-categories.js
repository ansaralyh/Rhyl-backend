const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Category = require('../models/Category');
const Product = require('../models/Product');

// Configure dotenv to load from the parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const migrate = async () => {
    try {
        console.log('Using MONGODB_URI:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const regions = ['Pakistani Product', 'Indian Product', 'Filipino Product'];

        // 1. Create or Find "Asian Products" category
        let asianCat = await Category.findOne({ name: 'Asian Products' });
        if (!asianCat) {
            asianCat = await Category.create({
                name: 'Asian Products',
                icon: 'flag',
                color: 'teal',
                description: 'Asian specialty items',
                priority: 0
            });
            console.log('Created "Asian Products" category');
        } else {
            console.log('Found existing "Asian Products" category');
        }

        // 2. Find old categories
        const oldCats = await Category.find({ name: { $in: regions } });
        const oldCatIds = oldCats.map(c => c._id);

        if (oldCatIds.length > 0) {
            console.log(`Found ${oldCatIds.length} regional categories to migrate.`);

            // 3. Update products
            const result = await Product.updateMany(
                { category: { $in: oldCatIds } },
                { category: asianCat._id }
            );
            console.log(`Updated ${result.modifiedCount} products to "Asian Products" category`);

            // 4. Delete old categories
            await Category.deleteMany({ _id: { $in: oldCatIds } });
            console.log(`Deleted old categories: ${oldCats.map(c => c.name).join(', ')}`);
        } else {
            console.log('No old regional categories found in database.');
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
