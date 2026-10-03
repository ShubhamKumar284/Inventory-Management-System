const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get low stock products
// @route   GET /api/alerts/low-stock
// @access  Private
const getLowStockAlerts = async (req, res, next) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$quantity', '$minimumStock'] },
      quantity: { $gt: 0 }, // Must be strictly greater than 0, otherwise it's out-of-stock
      status: 'ACTIVE'
    })
    .select('sku name quantity minimumStock location categoryId')
    .populate('categoryId', 'name')
    .lean();

    return successResponse(res, 200, 'Low stock alerts retrieved', products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get out of stock products
// @route   GET /api/alerts/out-of-stock
// @access  Private
const getOutOfStockAlerts = async (req, res, next) => {
  try {
    const products = await Product.find({
      quantity: 0,
      status: 'ACTIVE'
    })
    .select('sku name quantity minimumStock location categoryId')
    .populate('categoryId', 'name')
    .lean();

    return successResponse(res, 200, 'Out of stock alerts retrieved', products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get expiring products (next 30 days)
// @route   GET /api/alerts/expiring
// @access  Private
const getExpiringAlerts = async (req, res, next) => {
  try {
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    const products = await Product.find({
      expiryDate: {
        $gte: today,
        $lte: next30Days
      },
      quantity: { $gt: 0 }, // We only care about items we actually have in stock
      status: 'ACTIVE'
    })
    .select('sku name quantity expiryDate location categoryId')
    .populate('categoryId', 'name')
    .lean();

    return successResponse(res, 200, 'Expiring alerts retrieved', products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get expired products
// @route   GET /api/alerts/expired
// @access  Private
const getExpiredAlerts = async (req, res, next) => {
  try {
    const today = new Date();

    const products = await Product.find({
      expiryDate: {
        $lt: today
      },
      quantity: { $gt: 0 }, // We only care about expired items still sitting in the warehouse
      status: 'ACTIVE'
    })
    .select('sku name quantity expiryDate location categoryId')
    .populate('categoryId', 'name')
    .lean();

    return successResponse(res, 200, 'Expired alerts retrieved', products);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLowStockAlerts,
  getOutOfStockAlerts,
  getExpiringAlerts,
  getExpiredAlerts
};
