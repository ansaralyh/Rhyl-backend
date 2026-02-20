const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkCreateProducts
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.route('/')
    .get(getProducts)
    .post(protect, admin, createProduct);

router.post('/bulk', protect, admin, bulkCreateProducts);

router.route('/:id')
    .get(getProduct)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;
