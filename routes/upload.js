const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { cloudinary } = require('../config/cloudinary');
const { protect, admin } = require('../middleware/auth');

// @desc    Upload product image
// @route   POST /api/upload/product
// @access  Private/Admin
router.post('/product', protect, admin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Cloudinary automatically uploads the file and provides the URL
        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                filename: req.file.filename,
                path: req.file.path, // Cloudinary URL
                url: req.file.path,  // Same as path, for compatibility
                publicId: req.file.filename, // Cloudinary public ID
                size: req.file.size
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Delete uploaded image from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private/Admin
router.delete('/:publicId', protect, admin, async (req, res) => {
    try {
        const publicId = req.params.publicId;

        // Delete from Cloudinary
        // The public ID should include the folder path: rhyl-store/products/filename
        const fullPublicId = `rhyl-store/products/${publicId}`;

        const result = await cloudinary.uploader.destroy(fullPublicId);

        if (result.result === 'ok') {
            res.status(200).json({
                success: true,
                message: 'Image deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Image not found or already deleted'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
