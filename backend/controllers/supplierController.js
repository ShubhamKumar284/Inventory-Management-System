const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find().lean();
    
    // Get product counts for each supplier to display in the frontend table
    const supplierStats = await Product.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { _id: "$supplierId", productCount: { $sum: 1 } } }
    ]);
    
    const suppliersWithStats = suppliers.map(sup => {
      const stat = supplierStats.find(s => s._id?.toString() === sup._id.toString());
      return { ...sup, productCount: stat ? stat.productCount : 0 };
    });

    return successResponse(res, 200, 'Suppliers retrieved', suppliersWithStats);
  } catch (err) { next(err); }
};

exports.getSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return errorResponse(res, 404, 'Supplier not found');
    return successResponse(res, 200, 'Supplier retrieved', supplier);
  } catch (err) { next(err); }
};

exports.createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);
    return successResponse(res, 201, 'Supplier created', supplier);
  } catch (err) { next(err); }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supplier) return errorResponse(res, 404, 'Supplier not found');
    return successResponse(res, 200, 'Supplier updated', supplier);
  } catch (err) { next(err); }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    // Prevent deletion if supplier is actively assigned to products
    const productsUsingSupplier = await Product.findOne({ supplierId: req.params.id, status: 'ACTIVE' });
    if (productsUsingSupplier) return errorResponse(res, 400, 'Cannot delete supplier. They are currently supplying active inventory items.');
    
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return errorResponse(res, 404, 'Supplier not found');
    return successResponse(res, 200, 'Supplier deleted successfully', {});
  } catch (err) { next(err); }
};
