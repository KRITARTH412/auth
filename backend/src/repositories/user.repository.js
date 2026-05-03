const User = require('../models/User.model');

class UserRepository {
  /**
   * Create a new user
   * @param {Object} userData - User data (username, email, hashedPassword, role)
   * @returns {Promise<Object>} Created user document
   */
  async createUser(userData) {
    try {
      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        throw new Error(`${field} already exists`);
      }
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @param {boolean} includePassword - Whether to include password field
   * @returns {Promise<Object|null>} User document or null
   */
  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  /**
   * Find user by username
   * @param {string} username - Username
   * @param {boolean} includePassword - Whether to include password field
   * @returns {Promise<Object|null>} User document or null
   */
  async findByUsername(username, includePassword = false) {
    const query = User.findOne({ username });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User document or null
   */
  async findById(userId) {
    return User.findById(userId).exec();
  }

  /**
   * Find user by email or username
   * @param {string} identifier - Email or username
   * @param {boolean} includePassword - Whether to include password field
   * @returns {Promise<Object|null>} User document or null
   */
  async findByEmailOrUsername(identifier, includePassword = false) {
    const query = User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  /**
   * Update user data
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user document
   */
  async updateUser(userId, updateData) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { ...updateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );
      return user;
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new Error(`${field} already exists`);
      }
      throw error;
    }
  }

  /**
   * Store refresh token hash for user
   * @param {string} userId - User ID
   * @param {string} tokenHash - Hashed refresh token
   * @returns {Promise<Object>} Updated user document
   */
  async storeRefreshToken(userId, tokenHash) {
    return User.findByIdAndUpdate(
      userId,
      { refreshToken: tokenHash, updatedAt: Date.now() },
      { new: true }
    ).exec();
  }

  /**
   * Invalidate refresh token for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user document
   */
  async invalidateRefreshToken(userId) {
    return User.findByIdAndUpdate(
      userId,
      { refreshToken: null, updatedAt: Date.now() },
      { new: true }
    ).exec();
  }

  /**
   * Get refresh token for user
   * @param {string} userId - User ID
   * @returns {Promise<string|null>} Refresh token or null
   */
  async getRefreshToken(userId) {
    const user = await User.findById(userId).select('+refreshToken').exec();
    return user ? user.refreshToken : null;
  }

  /**
   * Update last login timestamp
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user document
   */
  async updateLastLogin(userId) {
    return User.findByIdAndUpdate(
      userId,
      { lastLogin: Date.now(), updatedAt: Date.now() },
      { new: true }
    ).exec();
  }

  /**
   * Get all users (admin function)
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of results
   * @param {number} skip - Number of results to skip
   * @returns {Promise<Array>} Array of user documents
   */
  async getAllUsers(filters = {}, limit = 100, skip = 0) {
    return User.find(filters).limit(limit).skip(skip).exec();
  }

  /**
   * Count users
   * @param {Object} filters - Query filters
   * @returns {Promise<number>} Count of users
   */
  async countUsers(filters = {}) {
    return User.countDocuments(filters).exec();
  }

  /**
   * Delete user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deleted user document
   */
  async deleteUser(userId) {
    return User.findByIdAndDelete(userId).exec();
  }
}

module.exports = new UserRepository();
