const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');

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

const addCateringCategory = async () => {
    try {
        await connectDB();

        const subcategories = [
            'Frozen',
            'Chips',
            'Nuggets',
            'Cheese Burgers',
            'Lamb Doner',
            'Chicken Doner',
            'Drinks',
            'Cleaning',
            'Oil',
            'Packaging',
            'Flour'
        ];

        // Check if Catering category already exists
        const existingCategory = await Category.findOne({ name: 'Catering' });

        if (existingCategory) {
            // Update existing category with subcategories
            existingCategory.subcategories = subcategories;
            await existingCategory.save();
            console.log('Updated existing Catering category with subcategories');
        } else {
            // Create new Catering category
            const cateringCategory = await Category.create({
                name: 'Catering',
                description: 'Catering supplies and products',
                icon: 'utensils',
                color: 'orange',
                priority: 5,
                subcategories: subcategories
            });

            console.log('Created Catering category with subcategories:');
        }

        console.log('Subcategories:', subcategories);
        console.log('\nCatering category setup complete!');

        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

addCateringCategory();
