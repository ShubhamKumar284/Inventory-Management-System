const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide name, email, and password');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return errorResponse(res, 400, 'User already exists with this email');
    }

    const user = await User.create({
      name,
      email,
      password, // Will be hashed automatically by pre-save hook
      role: role || 'ADMIN' // Default to ADMIN for presentation purposes
    });

    if (user) {
      return successResponse(res, 201, 'User registered successfully', {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      return errorResponse(res, 400, 'Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log(`[AUTH] Login attempt received for email: ${email}`);

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`[AUTH] User not found: ${email}`);
      return errorResponse(res, 401, 'Invalid email or password');
    }

    console.log(`[AUTH] User found. Comparing passwords...`);
    
    const isMatch = await user.matchPassword(password);
    console.log(`[AUTH] Password comparison result for ${email}: ${isMatch}`);

    if (isMatch) {
      return successResponse(res, 200, 'Login successful', {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      return errorResponse(res, 401, 'Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // req.user is set by the authMiddleware
    const user = await User.findById(req.user._id).select('-password');
    
    if (user) {
      return successResponse(res, 200, 'User profile retrieved', user);
    } else {
      return errorResponse(res, 404, 'User not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
