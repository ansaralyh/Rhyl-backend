const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { sendEmail, getOrderStatusEmailContent } = require('../utils/email');

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Make sure user owns order or is admin
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this order'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, customerName, customerEmail, customerPhone } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No order items'
            });
        }

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const order = await Order.create({
            user: req.user._id,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod,
            customerName,
            customerEmail,
            customerPhone
        });


        // Clear user's cart after order
        await Cart.findOneAndUpdate(
            { user: req.user._id },
            { items: [] }
        );

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, paymentStatus } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate('user', 'email')
            .lean();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        let emailSent = false;
        let emailError = null;
        const statusLower = (status || '').toLowerCase();
        if (statusLower === 'confirmed' || statusLower === 'delivered' || statusLower === 'cancelled') {
            const recipientEmail = (order.customerEmail && String(order.customerEmail).trim()) ||
                (order.user && order.user.email && String(order.user.email).trim()) || '';
            const toAddress = recipientEmail || '';
            if (toAddress) {
                try {
                    const { subject, html, text } = getOrderStatusEmailContent(statusLower, order._id.toString());
                    const result = await sendEmail(toAddress, subject, html, text);
                    emailSent = result.success;
                    if (!result.success) {
                        emailError = result.error || 'Send failed';
                        console.error('[Order] Status email failed for order', order._id, result.error);
                    }
                } catch (emailErr) {
                    emailError = emailErr.message || 'Email error';
                    console.error('[Order] Status email error:', emailErr.message);
                }
            } else {
                console.warn('[Order] No customer email for order', order._id, '- cannot send notification');
            }
        }

        const message = 'Order updated successfully.' +
            (emailSent ? ' Email sent successfully.' : (emailError ? ' Email could not be sent.' : ''));
        res.status(200).json({
            success: true,
            data: order,
            message,
            emailSent: statusLower === 'confirmed' || statusLower === 'delivered' || statusLower === 'cancelled' ? emailSent : undefined
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
