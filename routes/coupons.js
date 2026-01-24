const express = require('express');
const router = express.Router();
const { getCoupons, createCoupon, deleteCoupon, verifyCoupon } = require('../controllers/couponController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .get(protect, admin, getCoupons)
    .post(protect, admin, createCoupon);

router.route('/:id')
    .delete(protect, admin, deleteCoupon);

router.post('/verify', verifyCoupon);

module.exports = router;
