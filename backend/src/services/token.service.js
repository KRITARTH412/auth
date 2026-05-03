const jwt = require('jsonwebtoken');

class TokenService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    if (this.jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 256 bits (32 characters)');
    }
  }

  /**
   * Generate access token
   * @param {Object} payload - Token payload {userId, username, email, role}
   * @returns {string} JWT access token
   */
  generateAccessToken(payload) {
    const { userId, username, email, role } = payload;

    // Ensure password is never included in token
    const tokenPayload = {
      userId,
      username,
      email,
      role,
      type: 'access',
    };

    return jwt.sign(tokenPayload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry,
    });
  }

  /**
   * Generate refresh token
   * @param {Object} payload - Token payload {userId}
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(payload) {
    const { userId } = payload;

    const tokenPayload = {
      userId,
      type: 'refresh',
    };

    return jwt.sign(tokenPayload, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiry,
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @param {string} type - Token type ('access' or 'refresh')
   * @returns {Object} Decoded token payload
   * @throws {Error} If token is invalid, expired, or wrong type
   */
  verifyToken(token, type = 'access') {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);

      // Check token type
      if (decoded.type !== type) {
        throw new Error(`Invalid token type. Expected ${type}, got ${decoded.type}`);
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw error;
      }
    }
  }

  /**
   * Decode JWT token without verification
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new Error('Failed to decode token');
    }
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} payload - User payload {userId, username, email, role}
   * @returns {Object} {accessToken, refreshToken}
   */
  generateTokenPair(payload) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken({ userId: payload.userId });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Get token expiration time in seconds
   * @param {string} token - JWT token
   * @returns {number|null} Expiration time in seconds or null
   */
  getTokenExpiration(token) {
    try {
      const decoded = this.decodeToken(token);
      return decoded.exp || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} True if expired, false otherwise
   */
  isTokenExpired(token) {
    try {
      const exp = this.getTokenExpiration(token);
      if (!exp) return true;

      const now = Math.floor(Date.now() / 1000);
      return exp < now;
    } catch (error) {
      return true;
    }
  }
}

module.exports = new TokenService();
