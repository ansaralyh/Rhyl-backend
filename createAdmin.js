const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

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

const createAdmin = async () => {
    try {
        await connectDB();

        const email = 'admin@rhylstore.com';
        const password = 'admin@123';

        // Check if exists
        let user = await User.findOne({ email });

        if (user) {
            console.log('User exists, updating password and role...');
            user.password = password;
            user.role = 'admin';
            await user.save();
            console.log(`Admin user ${email} updated successfully.`);
        } else {
            console.log('User does not exist, creating new admin...');
            user = await User.create({
                name: 'Admin User',
                email: email,
                password: password,
                role: 'admin',
                phone: '+44 0000 000000'
            });
            console.log(`Admin user ${email} created successfully.`);
        }

        process.exit();
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
