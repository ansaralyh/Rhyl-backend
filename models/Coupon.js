const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please provide a coupon code'],
        unique: true,
        uppercase: true,
        trim: true
    },
    discount: {
        type: Number,
        required: [true, 'Please provide a discount percentage'],
        min: 1,
        max: 100
    },
    expiryDate: {
        type: Date,
        required: [true, 'Please provide an expiration date']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Coupon', couponSchema);
