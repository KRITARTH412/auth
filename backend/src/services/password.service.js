const bcrypt = require('bcrypt');

class PasswordService {
  constructor() {
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    
    // Ensure salt rounds is at least 10
    if (this.saltRounds < 10) {
      this.saltRounds = 10;
    }
  }

  /**
   * Hash a plain text password
   * @param {string} plainPassword - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(plainPassword) {
    try {
      if (!plainPassword || typeof plainPassword !== 'string') {
        throw new Error('Password must be a non-empty string');
      }

      const hashedPassword = await bcrypt.hash(plainPassword, this.saltRounds);
      return hashedPassword;
    } catch (error) {
      throw new Error(`Password hashing failed: ${error.message}`);
    }
  }

  /**
   * Compare plain text password with hashed password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password
   * @returns {Promise<boolean>} True if passwords match, false otherwise
   */
  async comparePassword(plainPassword, hashedPassword) {
    try {
      if (!plainPassword || typeof plainPassword !== 'string') {
        throw new Error('Password must be a non-empty string');
      }

      if (!hashedPassword || typeof hashedPassword !== 'string') {
        throw new Error('Hashed password must be a non-empty string');
      }

      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      throw new Error(`Password comparison failed: ${error.message}`);
    }
  }

  /**
   * Get current salt rounds configuration
   * @returns {number} Salt rounds
   */
  getSaltRounds() {
    return this.saltRounds;
  }
}

module.exports = new PasswordService();
