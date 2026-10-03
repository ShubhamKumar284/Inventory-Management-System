const express = require('express');
const router = express.Router();
const { getWarehouses, getWarehouse, createWarehouse, updateWarehouse, deleteWarehouse } = require('../controllers/warehouseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getWarehouses)
  .post(authorize('ADMIN', 'INVENTORY_MANAGER'), createWarehouse);

router.route('/:id')
  .get(getWarehouse)
  .put(authorize('ADMIN', 'INVENTORY_MANAGER'), updateWarehouse)
  .delete(authorize('ADMIN'), deleteWarehouse);

module.exports = router;
