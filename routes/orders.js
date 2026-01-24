const express = require('express');
const router = express.Router();
const {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    getAllOrders
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.route('/')
    .get(protect, getOrders)
    .post(protect, createOrder);

router.get('/admin/all', protect, admin, getAllOrders);

router.route('/:id')
    .get(protect, getOrder);

router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
