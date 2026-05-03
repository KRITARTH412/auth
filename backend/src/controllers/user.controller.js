const userRepository = require('../repositories/user.repository');
const validationService = require('../services/validation.service');
const ApiResponse = require('../utils/apiResponse');
const { SUCCESS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Get user profile
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await userRepository.findById(userId);

    if (!user) {
      return ApiResponse.notFoundError(res, 'User not found');
    }

    logger.debug(`Profile retrieved for user: ${userId}`);

    return ApiResponse.success(res, 200, 'Profile retrieved successfully', {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { username, email } = req.body;

    const updateData = {};

    // Validate and sanitize username if provided
    if (username) {
      const usernameValidation = validationService.validateUsername(username);
      if (!usernameValidation.isValid) {
        return ApiResponse.validationError(res, [
          { field: 'username', message: usernameValidation.message },
        ]);
      }
      updateData.username = validationService.sanitizeInput(username);
    }

    // Validate and sanitize email if provided
    if (email) {
      const emailValidation = validationService.validateEmail(email);
      if (!emailValidation.isValid) {
        return ApiResponse.validationError(res, [
          { field: 'email', message: emailValidation.message },
        ]);
      }
      updateData.email = validationService.sanitizeInput(email).toLowerCase();
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return ApiResponse.validationError(res, [
        { field: 'general', message: 'No fields to update' },
      ]);
    }

    // Update user
    const updatedUser = await userRepository.updateUser(userId, updateData);

    if (!updatedUser) {
      return ApiResponse.notFoundError(res, 'User not found');
    }

    logger.info(`Profile updated for user: ${userId}`);

    return ApiResponse.success(res, 200, SUCCESS.PROFILE_UPDATED, {
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    
    // Handle duplicate key error
    if (error.message.includes('already exists')) {
      return ApiResponse.conflictError(res, error.message);
    }
    
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
