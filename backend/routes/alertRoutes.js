const express = require('express');
const router = express.Router();
const {
  getLowStockAlerts,
  getOutOfStockAlerts,
  getExpiringAlerts,
  getExpiredAlerts
} = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

// All alert routes require authentication
router.use(protect);

router.get('/low-stock', getLowStockAlerts);
router.get('/out-of-stock', getOutOfStockAlerts);
router.get('/expiring', getExpiringAlerts);
router.get('/expired', getExpiredAlerts);

module.exports = router;
