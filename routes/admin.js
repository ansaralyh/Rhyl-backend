const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    getAnalytics
} = require('../controllers/adminController');
const { logout } = require('../controllers/authController');
const { protect, preventCache } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// All routes require authentication, admin role, and cache prevention
router.use(preventCache);
router.use(protect);
router.use(admin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/analytics', getAnalytics);
router.get('/logout', logout);

module.exports = router;
