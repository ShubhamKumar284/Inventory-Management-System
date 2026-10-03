const mongoose = require('mongoose');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Process Stock IN
// @route   POST /api/stock/in
// @access  Private (Admin, Inventory Manager)
const processStockIn = async (req, res, next) => {
  // 1. Initialize MongoDB Session for a Transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, quantity, supplierId, referenceNumber, notes, newUnitCost } = req.body;

    // 2. Input Validation
    if (!productId || !quantity || !referenceNumber) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 400, 'Product ID, quantity, and reference number are required');
    }

    if (quantity <= 0) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 400, 'Stock IN quantity must be greater than 0');
    }

    // 3. Fetch Product (bind to transaction session)
    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 404, 'Product not found');
    }

    // Optional: Validate supplier if explicitly provided
    if (supplierId) {
      const supplierExists = await mongoose.model('Supplier').findById(supplierId).session(session);
      if (!supplierExists) {
        await session.abortTransaction();
        session.endSession();
        return errorResponse(res, 400, 'Invalid supplier reference');
      }
    }

    // 4. Calculate Quantities
    const parsedQuantity = Number(quantity);
    const previousQuantity = product.quantity;
    const newQuantity = previousQuantity + parsedQuantity;

    // 5. Update the Product model
    product.quantity = newQuantity;
    if (newUnitCost !== undefined && newUnitCost >= 0) {
      product.unitCost = Number(newUnitCost);
    }
    await product.save({ session }); // Important: Save within the session

    // 6. Create the Stock Movement Ledger Record
    const movement = new StockMovement({
      productId: product._id,
      type: 'IN',
      quantity: parsedQuantity,
      previousQuantity,
      newQuantity,
      supplierId: supplierId || product.supplierId, // Default to product's main supplier if not provided
      referenceNumber,
      performedBy: req.user._id, // Got this from the auth middleware
      notes
    });

    await movement.save({ session }); // Save within the session

    // 7. Commit the Transaction (Saves both to DB simultaneously)
    await session.commitTransaction();
    session.endSession();

    return successResponse(res, 201, 'Stock IN processed successfully', product);
  } catch (error) {
    // 8. If ANY error occurs, Rollback everything!
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Process Stock OUT
// @route   POST /api/stock/out
// @access  Private (Admin, Inventory Manager)
const processStockOut = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, quantity, destination, referenceNumber, notes } = req.body;

    if (!productId || !quantity || !referenceNumber) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 400, 'Product ID, quantity, and reference number are required');
    }

    if (quantity <= 0) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 400, 'Stock OUT quantity must be greater than 0');
    }

    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 404, 'Product not found');
    }

    const parsedQuantity = Number(quantity);
    const previousQuantity = product.quantity;
    
    // CRITICAL: Check available inventory to prevent negative stock
    if (parsedQuantity > previousQuantity) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 400, `Insufficient stock. Available quantity: ${previousQuantity}`);
    }

    const newQuantity = previousQuantity - parsedQuantity;

    product.quantity = newQuantity;
    await product.save({ session });

    const movement = new StockMovement({
      productId: product._id,
      type: 'OUT',
      quantity: parsedQuantity,
      previousQuantity,
      newQuantity,
      destination,
      referenceNumber,
      performedBy: req.user._id,
      notes
    });

    await movement.save({ session });

    await session.commitTransaction();
    session.endSession();

    return successResponse(res, 201, 'Stock OUT processed successfully', product);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Get stock movement history
// @route   GET /api/stock/movements
// @access  Private
const getMovements = async (req, res, next) => {
  try {
    const {
      type, // 'IN' or 'OUT'
      product, // productId
      user, // userId
      startDate,
      endDate,
      reference, // referenceNumber search
      sort = '-timestamp', // default newest first
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    // Exact matches
    if (type) query.type = type;
    if (product) query.productId = product;
    if (user) query.performedBy = user;
    
    // Search by reference number (case-insensitive regex)
    if (reference) {
      query.referenceNumber = { $regex: reference, $options: 'i' };
    }

    // Date range filtering
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Pagination setup
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const movements = await StockMovement.find(query)
      .populate('productId', 'name sku')
      .populate('performedBy', 'name email')
      .populate('supplierId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(); // Use lean for faster reads

    const total = await StockMovement.countDocuments(query);

    return successResponse(res, 200, 'Stock movements retrieved', {
      movements,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single stock movement by ID
// @route   GET /api/stock/movements/:id
// @access  Private
const getMovementById = async (req, res, next) => {
  try {
    const movement = await StockMovement.findById(req.params.id)
      .populate('productId', 'name sku categoryId unitCost')
      .populate('performedBy', 'name email role')
      .populate('supplierId', 'name contactPerson email phone')
      .lean();

    if (!movement) {
      return errorResponse(res, 404, 'Stock movement not found');
    }

    return successResponse(res, 200, 'Stock movement details retrieved', movement);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processStockIn,
  processStockOut,
  getMovements,
  getMovementById
};
