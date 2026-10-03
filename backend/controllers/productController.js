const mongoose = require('mongoose');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper function to validate references
const validateReferences = async (categoryId, supplierId, warehouseId, res) => {
  if (categoryId) {
    const categoryExists = await mongoose.model('Category').findById(categoryId);
    if (!categoryExists) return { error: 'Invalid category reference' };
  }
  if (supplierId) {
    const supplierExists = await mongoose.model('Supplier').findById(supplierId);
    if (!supplierExists) return { error: 'Invalid supplier reference' };
  }
  if (warehouseId) {
    const warehouseExists = await mongoose.model('Warehouse').findById(warehouseId);
    if (!warehouseExists) return { error: 'Invalid warehouse reference' };
  }
  return { success: true };
};

// @desc    Get all products (with search, filter, pagination, sorting)
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
  try {
    const {
      search, // Search by name or SKU
      category, // Filter by category ID
      supplier, // Filter by supplier ID
      warehouse, // Filter by warehouse ID
      status, // Filter by status (ACTIVE/INACTIVE)
      lowStock, // boolean 'true'
      outOfStock, // boolean 'true'
      sort, // field name, prepend with '-' for desc (e.g., -unitCost)
      page = 1,
      limit = 10
    } = req.query;

    let query = { status: { $ne: 'INACTIVE' } };

    // Search by name or SKU (case-insensitive regex)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // Exact matches
    if (category) query.categoryId = category;
    if (supplier) query.supplierId = supplier;
    if (warehouse) query.warehouseId = warehouse;
    if (status) query.status = status;

    // Stock filters
    if (outOfStock === 'true') {
      query.quantity = 0;
    } else if (lowStock === 'true') {
      // Products where quantity is less than or equal to minimumStock, but greater than 0
      query.$expr = { $lte: ['$quantity', '$minimumStock'] };
      query.quantity = { $gt: 0 };
    }

    // Pagination setup
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortField = sort ? sort.split(',').join(' ') : '-createdAt';

    // Execute query
    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('supplierId', 'name')
      .populate('warehouseId', 'name')
      .sort(sortField)
      .skip(skip)
      .limit(limitNum)
      .lean(); // Use lean() for performance since we modify objects next

    // Total count for pagination
    const total = await Product.countDocuments(query);

    // Calculate inventory value
    const productsWithValue = products.map(product => ({
      ...product,
      inventoryValue: product.quantity * product.unitCost
    }));

    return successResponse(res, 200, 'Products retrieved successfully', {
      products: productsWithValue,
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

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name description')
      .populate('supplierId', 'name contactPerson phone email')
      .populate('warehouseId', 'name location')
      .lean();

    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    // Add calculated inventory value
    product.inventoryValue = product.quantity * product.unitCost;

    return successResponse(res, 200, 'Product retrieved', product);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Admin, Manager)
const createProduct = async (req, res, next) => {
  try {
    const {
      sku, name, description, categoryId, quantity,
      minimumStock, unitCost, supplierId, warehouseId,
      location, expiryDate, status, imageUrl
    } = req.body;

    // Basic Validation
    if (!sku || !name || !categoryId || unitCost === undefined) {
      return errorResponse(res, 400, 'SKU, name, category, and unit cost are required');
    }

    // Check unique SKU
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return errorResponse(res, 400, `Product with SKU ${sku} already exists`);
    }

    // Validation for non-negative numbers
    if (quantity < 0 || minimumStock < 0 || unitCost < 0) {
      return errorResponse(res, 400, 'Quantity, minimum stock, and unit cost cannot be negative');
    }

    // Validate related collections
    const refCheck = await validateReferences(categoryId, supplierId, warehouseId, res);
    if (refCheck.error) return errorResponse(res, 400, refCheck.error);

    const product = await Product.create({
      sku, name, description, categoryId,
      quantity: quantity || 0,
      minimumStock: minimumStock || 0,
      unitCost, supplierId, warehouseId,
      location, expiryDate, status, imageUrl
    });

    return successResponse(res, 201, 'Product created successfully', product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin, Manager)
const updateProduct = async (req, res, next) => {
  try {
    const {
      name, description, categoryId, minimumStock,
      unitCost, supplierId, warehouseId, location,
      expiryDate, status, quantity, imageUrl
    } = req.body;
    
    // Allowed direct updates to quantity as requested by user
    
    // If SKU is provided, ensure it's not taken by another product
    if (req.body.sku) {
       const skuExists = await Product.findOne({ sku: req.body.sku, _id: { $ne: req.params.id } });
       if (skuExists) return errorResponse(res, 400, 'SKU is already in use by another product');
    }

    // Validate related collections
    const refCheck = await validateReferences(categoryId, supplierId, warehouseId, res);
    if (refCheck.error) return errorResponse(res, 400, refCheck.error);

    const product = await Product.findById(req.params.id);

    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    // Update fields
    if (req.body.sku) product.sku = req.body.sku;
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (categoryId) product.categoryId = categoryId;
    if (minimumStock !== undefined) product.minimumStock = minimumStock;
    if (unitCost !== undefined) product.unitCost = unitCost;
    if (quantity !== undefined) product.quantity = quantity;
    if (supplierId) product.supplierId = supplierId;
    if (warehouseId) product.warehouseId = warehouseId;
    if (location !== undefined) product.location = location;
    if (expiryDate !== undefined) product.expiryDate = expiryDate;
    if (status) product.status = status;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;

    await product.save();

    return successResponse(res, 200, 'Product updated successfully', product);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin Only)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }

    // Restrictions on delete:
    // 1. Check if product has active inventory
    if (product.quantity > 0) {
      return errorResponse(res, 400, 'Cannot delete product with existing stock. Please issue stock OUT to 0 first.');
    }

    // 2. Check if product has associated stock movements (audit trail)
    const hasMovements = await StockMovement.findOne({ productId: req.params.id });
    if (hasMovements) {
      // Soft delete: keep the record for history but mark as inactive
      product.status = 'INACTIVE';
      await product.save();
      return successResponse(res, 200, 'Product has movement history. Status safely changed to INACTIVE instead of permanent deletion.');
    }

    // Safe to permanently delete
    await product.deleteOne();
    return successResponse(res, 200, 'Product permanently deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
