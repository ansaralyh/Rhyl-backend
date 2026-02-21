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
const { sendEmail } = require('../utils/email');

// All routes require authentication, admin role, and cache prevention
router.use(preventCache);
router.use(protect);
router.use(admin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/analytics', getAnalytics);
router.get('/logout', logout);

// Test email endpoint: POST /api/admin/test-email  body: { to: "someone@example.com" }
router.post('/test-email', async (req, res) => {
    const to = req.body.to || process.env.EMAIL_USER;
    const result = await sendEmail(
        to,
        'Rhyl Store - Email Test',
        '<h2>Email is working!</h2><p>Your Gmail SMTP configuration is correct.</p>',
        'Email is working! Your Gmail SMTP configuration is correct.'
    );
    res.json({
        success: result.success,
        to,
        emailUser: process.env.EMAIL_USER || 'NOT SET',
        emailPassSet: !!process.env.EMAIL_PASS,
        error: result.error || null
    });
});

module.exports = router;
