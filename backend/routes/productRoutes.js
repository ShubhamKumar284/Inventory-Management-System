const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All product routes require authentication
router.use(protect);

router.route('/')
  .get(getProducts) // Any authenticated user (Admin, Manager, Viewer) can view products
  .post(authorize('ADMIN', 'INVENTORY_MANAGER'), createProduct); // Only Admin/Manager can add new inventory profiles

router.route('/:id')
  .get(getProductById)
  .put(authorize('ADMIN', 'INVENTORY_MANAGER'), updateProduct) // Only Admin/Manager can edit details
  .delete(authorize('ADMIN'), deleteProduct); // Strict constraint: Only Admins can attempt deletion

module.exports = router;
