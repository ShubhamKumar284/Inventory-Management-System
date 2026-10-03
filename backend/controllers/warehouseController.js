const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getWarehouses = async (req, res, next) => {
  try {
    const warehouses = await Warehouse.find().lean();
    
    // Aggregate live capacity data from the Product collection
    const warehouseStats = await Product.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { 
          _id: "$warehouseId", 
          itemCount: { $sum: 1 },
          totalUnits: { $sum: "$quantity" }
      }}
    ]);
    
    const warehousesWithStats = warehouses.map(wh => {
      const stat = warehouseStats.find(s => s._id?.toString() === wh._id.toString());
      return { 
        ...wh, 
        itemCount: stat ? stat.itemCount : 0,
        totalUnits: stat ? stat.totalUnits : 0
      };
    });

    return successResponse(res, 200, 'Warehouses retrieved', warehousesWithStats);
  } catch (err) { next(err); }
};

exports.getWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return errorResponse(res, 404, 'Warehouse not found');
    return successResponse(res, 200, 'Warehouse retrieved', warehouse);
  } catch (err) { next(err); }
};

exports.createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.create(req.body);
    return successResponse(res, 201, 'Warehouse created', warehouse);
  } catch (err) { next(err); }
};

exports.updateWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!warehouse) return errorResponse(res, 404, 'Warehouse not found');
    return successResponse(res, 200, 'Warehouse updated', warehouse);
  } catch (err) { next(err); }
};

exports.deleteWarehouse = async (req, res, next) => {
  try {
    // Prevent deletion if items are still physically in this warehouse
    const productsUsingWarehouse = await Product.findOne({ warehouseId: req.params.id, status: 'ACTIVE' });
    if (productsUsingWarehouse) return errorResponse(res, 400, 'Cannot delete a warehouse that still contains inventory items. Relocate items first.');
    
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) return errorResponse(res, 404, 'Warehouse not found');
    return successResponse(res, 200, 'Warehouse deleted', {});
  } catch (err) { next(err); }
};
