# Secure User Authentication System

A production-ready, full-stack MERN (MongoDB, Express.js, React, Node.js) authentication system with enterprise-grade security features including JWT-based authentication, bcrypt password hashing, comprehensive input validation, rate limiting, and protection against common web vulnerabilities.

## Features

### Core Features
-  **User Registration** - Secure account creation with validation
-  **User Login** - JWT-based stateless authentication
-  **Protected Routes** - Middleware-based route protection
-  **Session Management** - HTTP-only cookies for token storage
-  **Input Validation** - Server-side validation with express-validator
-  **Input Sanitization** - XSS and NoSQL injection prevention
-  **Error Handling** - Comprehensive error handling with logging

### Security Features
- **Password Hashing** - bcrypt with configurable salt rounds (min 10)
-  **JWT Tokens** - Signed tokens with expiration (15min access, 7day refresh)
-  **HTTP-Only Cookies** - Secure token storage (httpOnly, secure, sameSite)
-  **Security Headers** - Helmet middleware (CSP, HSTS, X-Frame-Options, etc.)
-  **CORS Configuration** - Specific origin restrictions
-  **Rate Limiting** - Brute force protection (5 login/15min, 3 register/hour)
-  **NoSQL Injection Prevention** - express-mongo-sanitize
-  **XSS Prevention** - Input sanitization and DOMPurify

### Bonus Features
-  **Token Refresh** - Seamless session extension
-  **Logout Functionality** - Token invalidation
-  **Role-Based Access Control (RBAC)** - User, Moderator, Admin roles
-  **Comprehensive Logging** - Winston logger with file rotation

### Code Quality
-  **MVC Architecture** - Clean separation of concerns
-  **Repository Pattern** - Database abstraction layer
-  **Service Layer** - Business logic separation
-  **Middleware Chain** - Reusable middleware components
-  **Error Handling** - Centralized error handling
-  **Environment Configuration** - dotenv for configuration management

##  Project Structure

```
secure-auth-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # MongoDB connection
│   │   │   └── security.js          # Security configuration
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # JWT verification
│   │   │   ├── rbac.middleware.js   # Role-based access control
│   │   │   ├── validation.middleware.js  # Input validation
│   │   │   ├── rateLimiter.middleware.js # Rate limiting
│   │   │   ├── sanitizer.middleware.js   # Input sanitization
│   │   │   └── errorHandler.middleware.js # Error handling
│   │   ├── models/
│   │   │   └── User.model.js        # Mongoose User schema
│   │   ├── controllers/
│   │   │   ├── auth.controller.js   # Auth logic
│   │   │   ├── user.controller.js   # User operations
│   │   │   └── admin.controller.js  # Admin operations
│   │   ├── routes/
│   │   │   ├── auth.routes.js       # Auth endpoints
│   │   │   ├── user.routes.js       # User endpoints
│   │   │   └── admin.routes.js      # Admin endpoints
│   │   ├── services/
│   │   │   ├── token.service.js     # JWT operations
│   │   │   ├── password.service.js  # Password hashing
│   │   │   └── validation.service.js # Validation logic
│   │   ├── repositories/
│   │   │   └── user.repository.js   # Database operations
│   │   ├── utils/
│   │   │   ├── logger.js            # Winston logger
│   │   │   ├── apiResponse.js       # Response formatting
│   │   │   └── constants.js         # App constants
│   │   ├── app.js                   # Express app
│   │   └── server.js                # Server entry point
│   ├── .env                         # Environment variables
│   ├── .env.example                 # Environment template
│   ├── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                # Auth components
│   │   │   ├── common/              # Shared components
│   │   │   └── dashboard/           # Dashboard components
│   │   ├── services/
│   │   │   └── api.service.js       # API client
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state management
│   │   ├── hooks/
│   │   │   └── useAuth.js           # Auth hook
│   │   └── utils/
│   │       └── validators.js        # Client validation
│   └── package.json
└── README.md
```

##  Installation & Setup

### Prerequisites
- Node.js (v18+ LTS)
- MongoDB (v6.0+)
- npm or yarn

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd secure-auth-system
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auth-system
JWT_SECRET=your-super-secret-jwt-key-minimum-256-bits-change-this
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_ENABLED=true
LOG_LEVEL=debug
```

**IMPORTANT**: Change `JWT_SECRET` to a strong random string (minimum 256 bits / 32 characters)

4. **Start MongoDB**
```bash
# Using MongoDB service
sudo systemctl start mongod

```

5. **Start the backend server**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Install frontend dependencies**
```bash
cd frontend
npm install
```

2. **Start the frontend development server**
```bash
npm start
```

Frontend will run on `http://localhost:3000`

##  API Endpoints

### Swagger Documentation

Interactive API documentation is available at:
- **Development**: http://localhost:5000/api/docs
- **Production**: https://your-domain.com/api/docs

The Swagger UI provides:
-  Complete API reference with request/response examples
-  Interactive "Try it out" functionality
-  Schema definitions and validation rules
-  Authentication testing with cookies
-  Export OpenAPI specification (JSON)

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

Sets HTTP-only cookies: `accessToken`, `refreshToken`

#### Logout User
```http
POST /api/auth/logout
Cookie: accessToken=<token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Cookie: refreshToken=<token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully"
}
```

### User Endpoints

#### Get Profile
```http
GET /api/users/profile
Cookie: accessToken=<token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Update Profile
```http
PUT /api/users/profile
Cookie: accessToken=<token>
Content-Type: application/json

{
  "username": "johndoe_updated",
  "email": "john.new@example.com"
}
```

### Admin Endpoints

#### Get All Users (Admin Only)
```http
GET /api/admin/users?limit=100&skip=0&role=user
Cookie: accessToken=<admin-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "users": [...],
  "count": 150,
  "limit": 100,
  "skip": 0
}
```

## Security Best Practices

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### JWT Configuration
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Tokens stored in HTTP-only cookies
- Secure flag enabled in production
- SameSite attribute set to 'strict'

### Rate Limiting
- Login: 5 attempts per 15 minutes per IP
- Registration: 3 attempts per hour per IP
- General API: 100 requests per 15 minutes per IP

### Security Headers (Helmet)
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security
- X-Download-Options
- Referrer-Policy: no-referrer


## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| NODE_ENV | Environment mode | development | Yes |
| PORT | Server port | 5000 | Yes |
| MONGODB_URI | MongoDB connection string | - | Yes |
| JWT_SECRET | JWT signing secret (min 256 bits) | - | Yes |
| JWT_ACCESS_EXPIRY | Access token expiration | 15m | Yes |
| JWT_REFRESH_EXPIRY | Refresh token expiration | 7d | Yes |
| BCRYPT_SALT_ROUNDS | Bcrypt salt rounds (min 10) | 10 | Yes |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:3000 | Yes |
| RATE_LIMIT_ENABLED | Enable rate limiting | true | No |
| LOG_LEVEL | Logging level | debug | No |

##  Deployment

### Production Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/auth-system
JWT_SECRET=<strong-random-secret-256-bits>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_ENABLED=true
LOG_LEVEL=info
```

## API Documentation

Full API documentation available in Postman format:
- Import `postman_collection.json` into Postman
- Or view Swagger documentation at `/api/docs` (when enabled)

##  License

This project is licensed under the ISC License.

##  Author

Built as a technical assignment demonstrating secure authentication implementation following industry best practices.

##  Acknowledgments

- Express.js for the web framework
- MongoDB for the database
- JWT for token-based authentication
- bcrypt for password hashing
- Helmet for security headers
- Winston for logging

---

# Swagger API Documentation Guide

## Overview

This project includes comprehensive Swagger/OpenAPI 3.0 documentation for all API endpoints. The interactive documentation provides a user-friendly interface to explore, test, and under# Swagger API Documentation Guide

## Overview

This project includes comprehensive Swagger/OpenAPI 3.0 documentation for all API endpoints. The interactive documentation provides a user-friendly interface to explore, test, and understand the API.

## Accessing Swagger UI

### Development
```
http://localhost:5000/api/docsstand the API.

## Accessing Swagger UI

### Development
```
http://localhost:5000/api/docs


**Note**: This is a production-ready authentication system. Always review and customize security settings based on your specific requirements before deploying to production.
