const express = require('express');
const router = express.Router();
const { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getSuppliers)
  .post(authorize('ADMIN', 'INVENTORY_MANAGER'), createSupplier);

router.route('/:id')
  .get(getSupplier)
  .put(authorize('ADMIN', 'INVENTORY_MANAGER'), updateSupplier)
  .delete(authorize('ADMIN'), deleteSupplier);

module.exports = router;
