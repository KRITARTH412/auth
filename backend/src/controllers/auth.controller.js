const userRepository = require('../repositories/user.repository');
const passwordService = require('../services/password.service');
const tokenService = require('../services/token.service');
const validationService = require('../services/validation.service');
const ApiResponse = require('../utils/apiResponse');
const { COOKIES, COOKIE_OPTIONS, SUCCESS, ERRORS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validate registration data
    const validation = validationService.validateRegistration({ username, email, password });
    if (!validation.isValid) {
      return ApiResponse.validationError(res, validation.errors);
    }

    // Sanitize inputs
    const sanitizedData = validationService.sanitizeObject(
      { username, email },
      ['username', 'email']
    );

    // Check for duplicate email
    const existingEmail = await userRepository.findByEmail(sanitizedData.email);
    if (existingEmail) {
      return ApiResponse.conflictError(res, 'Email already exists');
    }

    // Check for duplicate username
    const existingUsername = await userRepository.findByUsername(sanitizedData.username);
    if (existingUsername) {
      return ApiResponse.conflictError(res, 'Username already exists');
    }

    // Hash password
    const hashedPassword = await passwordService.hashPassword(password);

    // Create user
    const user = await userRepository.createUser({
      username: sanitizedData.username,
      email: sanitizedData.email,
      password: hashedPassword,
      role: 'user', // Default role
    });

    logger.info(`User registered successfully: ${user._id}`);

    // Return success response (password excluded by toJSON transform)
    return ApiResponse.success(res, 201, SUCCESS.REGISTRATION, {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    // Validate login data
    const validation = validationService.validateLogin({ identifier, password });
    if (!validation.isValid) {
      return ApiResponse.validationError(res, validation.errors);
    }

    // Sanitize identifier
    const sanitizedIdentifier = validationService.sanitizeInput(identifier);

    // Find user by email or username
    const user = await userRepository.findByEmailOrUsername(sanitizedIdentifier, true);

    // Return generic error if user not found (prevent user enumeration)
    if (!user) {
      logger.warn(`Login failed: User not found for identifier ${sanitizedIdentifier}`);
      return ApiResponse.authError(res, ERRORS.INVALID_CREDENTIALS);
    }

    // Compare password
    const isPasswordValid = await passwordService.comparePassword(password, user.password);

    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password for user ${user._id}`);
      return ApiResponse.authError(res, ERRORS.INVALID_CREDENTIALS);
    }

    // Generate tokens
    const { accessToken, refreshToken } = tokenService.generateTokenPair({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    });

    // Store refresh token hash in database
    const refreshTokenHash = await passwordService.hashPassword(refreshToken);
    await userRepository.storeRefreshToken(user._id, refreshTokenHash);

    // Update last login timestamp
    await userRepository.updateLastLogin(user._id);

    // Set HTTP-only cookies
    const accessTokenExpiry = 15 * 60 * 1000; // 15 minutes in milliseconds
    const refreshTokenExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    res.cookie(COOKIES.ACCESS_TOKEN, accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: accessTokenExpiry,
    });

    res.cookie(COOKIES.REFRESH_TOKEN, refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: refreshTokenExpiry,
    });

    logger.info(`User logged in successfully: ${user._id}`);

    // Return success response
    return ApiResponse.success(res, 200, SUCCESS.LOGIN, {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Invalidate refresh token in database
    await userRepository.invalidateRefreshToken(userId);

    // Clear cookies
    res.clearCookie(COOKIES.ACCESS_TOKEN, COOKIE_OPTIONS);
    res.clearCookie(COOKIES.REFRESH_TOKEN, COOKIE_OPTIONS);

    logger.info(`User logged out successfully: ${userId}`);

    return ApiResponse.success(res, 200, SUCCESS.LOGOUT);
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res, next) => {
  try {
    // Extract refresh token from cookie
    const refreshToken = req.cookies[COOKIES.REFRESH_TOKEN];

    if (!refreshToken) {
      return ApiResponse.authError(res, ERRORS.AUTH_REQUIRED);
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = tokenService.verifyToken(refreshToken, 'refresh');
    } catch (error) {
      logger.warn('Refresh token verification failed:', error.message);
      return ApiResponse.authError(res, error.message);
    }

    // Get stored refresh token hash from database
    const storedTokenHash = await userRepository.getRefreshToken(decoded.userId);

    if (!storedTokenHash) {
      logger.warn(`Refresh token not found in database for user ${decoded.userId}`);
      return ApiResponse.authError(res, ERRORS.INVALID_TOKEN);
    }

    // Compare refresh token with stored hash
    const isTokenValid = await passwordService.comparePassword(refreshToken, storedTokenHash);

    if (!isTokenValid) {
      logger.warn(`Refresh token mismatch for user ${decoded.userId}`);
      return ApiResponse.authError(res, ERRORS.INVALID_TOKEN);
    }

    // Get user data
    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      return ApiResponse.authError(res, ERRORS.USER_NOT_FOUND);
    }

    // Generate new access token
    const newAccessToken = tokenService.generateAccessToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    });

    // Set new access token cookie
    const accessTokenExpiry = 15 * 60 * 1000; // 15 minutes
    res.cookie(COOKIES.ACCESS_TOKEN, newAccessToken, {
      ...COOKIE_OPTIONS,
      maxAge: accessTokenExpiry,
    });

    logger.info(`Access token refreshed for user: ${user._id}`);

    return ApiResponse.success(res, 200, SUCCESS.TOKEN_REFRESHED);
  } catch (error) {
    logger.error('Token refresh error:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
