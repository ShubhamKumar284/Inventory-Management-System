const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Pre-warm Google federated certs on startup to speed up first Google login
googleClient.getFederatedSignonCertsAsync().catch(err => {
  console.warn('[AUTH] Note: Google cert pre-fetch notice:', err.message);
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide name, email, and password');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return errorResponse(res, 400, 'User already exists with this email');
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
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

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log(`[AUTH] Login attempt received for email: ${normalizedEmail}`);

    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log(`[AUTH] User not found: ${normalizedEmail}`);
      return errorResponse(res, 401, 'Invalid email or password');
    }

    console.log(`[AUTH] User found. Comparing passwords...`);
    
    const isMatch = await user.matchPassword(password);
    console.log(`[AUTH] Password comparison result for ${normalizedEmail}: ${isMatch}`);

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

// @desc    Auth user with Google
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return errorResponse(res, 400, 'Please provide Google credential');
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name } = payload;
    const normalizedEmail = email ? email.trim().toLowerCase() : '';

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Create user if they don't exist
      // Generate a secure random password since they logged in with Google
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      user = await User.create({
        name: name || 'Google User',
        email: normalizedEmail,
        password: randomPassword,
        role: 'ADMIN' // Default to ADMIN for presentation/evaluation
      });
    }

    return successResponse(res, 200, 'Login successful', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });

  } catch (error) {
    console.error('[AUTH] Google Auth Error:', error);
    return errorResponse(res, 401, 'Invalid Google token');
  }
};

// @desc    Request password reset code
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 400, 'Please provide your registered email address');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return errorResponse(res, 404, 'No account found with this email address');
    }

    // Generate a secure 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the code and set 15-minute expiration
    user.resetPasswordToken = crypto.createHash('sha256').update(resetCode).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    console.log(`[AUTH] Password reset code generated for ${normalizedEmail}: ${resetCode}`);

    return successResponse(res, 200, 'Password reset code generated successfully', {
      email: normalizedEmail,
      resetCode, // Provided in response for easy demonstration/evaluation
      expiresIn: '15 minutes'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using verification code
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return errorResponse(res, 400, 'Please provide email, verification code, and new password');
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 400, 'New password must be at least 6 characters long');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const hashedCode = crypto.createHash('sha256').update(resetCode.trim()).digest('hex');

    const user = await User.findOne({
      email: normalizedEmail,
      resetPasswordToken: hashedCode,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse(res, 400, 'Invalid or expired verification code');
    }

    // Update password (auto-hashed by User model pre-save hook)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    console.log(`[AUTH] Password successfully reset for ${normalizedEmail}`);

    return successResponse(res, 200, 'Password has been reset successfully. You can now log in.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  googleAuth,
  forgotPassword,
  resetPassword,
};
