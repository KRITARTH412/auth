const userRepository = require('../repositories/user.repository');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Get all users (admin only)
 * GET /api/admin/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { limit = 100, skip = 0, role } = req.query;

    const filters = {};
    if (role) {
      filters.role = role;
    }

    const users = await userRepository.getAllUsers(filters, parseInt(limit), parseInt(skip));
    const count = await userRepository.countUsers(filters);

    logger.info(`Admin ${req.user.userId} retrieved ${users.length} users`);

    return ApiResponse.success(res, 200, 'Users retrieved successfully', {
      users: users.map((user) => ({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      })),
      count,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    next(error);
  }
};

module.exports = {
  getAllUsers,
};
