const Category = require('../models/Category');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    return successResponse(res, 200, 'Categories retrieved', categories);
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return errorResponse(res, 400, 'Name is required');
    const cat = await Category.create({ name, description });
    return successResponse(res, 201, 'Category created', cat);
  } catch (error) {
    next(error);
  }
};
