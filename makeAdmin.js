const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const makeAdmin = async () => {
    try {
        await connectDB();

        const email = 'zain@gmail.com'; // The email from the screenshot
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found.`);
            // Optionally create it or check for 'admin@rhylstore.com'
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`User ${email} is now an ADMIN.`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

makeAdmin();
