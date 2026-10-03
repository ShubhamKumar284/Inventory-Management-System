const express = require('express');
const router = express.Router();
const {
  getSummary,
  getStockTrends,
  getCategoryDistribution,
  getRecentMovements
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', getSummary);
router.get('/stock-trends', getStockTrends);
router.get('/category-distribution', getCategoryDistribution);
router.get('/recent-movements', getRecentMovements);

module.exports = router;
