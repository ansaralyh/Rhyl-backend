const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
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

const categories = [
    { name: 'Fresh Produce', icon: 'apple', color: 'green', description: 'Fresh fruits and vegetables' },
    { name: 'Grocery & Staples', icon: 'wheat', color: 'amber', description: 'Essential grocery items' },
    { name: 'Spices & Masala', icon: 'flame', color: 'red', description: 'Spices and seasonings' },
    { name: 'Dairy Products', icon: 'milk', color: 'blue', description: 'Milk, cheese, and dairy' },
    { name: 'Meat & Frozen', icon: 'snowflake', color: 'rose', description: 'Frozen foods and meat' },
    { name: 'Packaged Food', icon: 'package', color: 'orange', description: 'Packaged and canned foods' },
    { name: 'Snacks & Bakery', icon: 'croissant', color: 'yellow', description: 'Snacks and baked goods' },
    { name: 'Beverages', icon: 'coffee', color: 'teal', description: 'Drinks and beverages' },
    { name: 'Household', icon: 'home', color: 'slate', description: 'Cleaning and household items' },
    { name: 'Personal Care', icon: 'smile', color: 'purple', description: 'Personal care products' },
    { name: 'Baby Care', icon: 'baby', color: 'pink', description: 'Baby products and care' },
    { name: 'Pakistani Product', icon: 'flag', color: 'green', description: 'Pakistani specialty items' },
    { name: 'Indian Product', icon: 'flag', color: 'orange', description: 'Indian specialty items' },
    { name: 'African Product', icon: 'flag', color: 'yellow', description: 'African specialty items' },
    { name: 'Filipino Product', icon: 'flag', color: 'blue', description: 'Filipino specialty items' }
];

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Product.deleteMany();
        await Category.deleteMany();

        console.log('Data cleared');

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@rhylstore.com',
            password: 'admin123',
            role: 'admin',
            phone: '+44 1234 567890',
            address: {
                street: '123 High Street',
                city: 'Rhyl',
                postcode: 'LL18 1AA',
                country: 'UK'
            }
        });

        console.log('Admin user created');

        // Create test customer
        const customer = await User.create({
            name: 'Test Customer',
            email: 'customer@test.com',
            password: 'customer123',
            role: 'customer'
        });

        console.log('Test customer created');

        // Create categories
        // Create categories
        const createdCategories = [];
        for (const cat of categories) {
            createdCategories.push(await Category.create(cat));
        }
        console.log('Categories created');

        // Sample products removed as per user request
        console.log('Skipping sample products creation');
        const products = [];
        console.log('Sample products created');

        console.log('\n=== Seed Data Summary ===');
        console.log(`Admin Email: admin@rhylstore.com`);
        console.log(`Admin Password: admin123`);
        console.log(`Customer Email: customer@test.com`);
        console.log(`Customer Password: customer123`);
        console.log(`Categories: ${createdCategories.length}`);
        console.log(`Products: ${products.length}`);
        console.log('=========================\n');

        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
