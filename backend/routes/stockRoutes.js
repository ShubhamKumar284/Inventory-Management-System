const express = require('express');
const router = express.Router();
const { processStockIn, processStockOut, getMovements, getMovementById } = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All stock operations require authentication
router.use(protect);

// POST /api/stock/in -> Only Admin and Manager can process stock in
router.post('/in', authorize('ADMIN', 'INVENTORY_MANAGER'), processStockIn);

// POST /api/stock/out -> Only Admin and Manager can process stock out
router.post('/out', authorize('ADMIN', 'INVENTORY_MANAGER'), processStockOut);

// GET /api/stock/movements -> View history
router.get('/movements', getMovements);

// GET /api/stock/movements/:id -> View specific history record
router.get('/movements/:id', getMovementById);

module.exports = router;
