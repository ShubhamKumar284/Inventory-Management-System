const Category = require('../models/Category');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return successResponse(res, 200, 'Categories retrieved', categories);
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) return errorResponse(res, 400, 'Category name is required');
    
    // Check if category already exists (case-insensitive)
    const existing = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    if (existing) {
      return successResponse(res, 200, 'Category already exists', existing);
    }

    const cat = await Category.create({ name: name.trim(), description });
    return successResponse(res, 201, 'Category created', cat);
  } catch (error) {
    next(error);
  }
};
