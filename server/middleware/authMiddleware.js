const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and protect sensitive routes
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and begins with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Not authorized, no token provided'
      });
    }

    // Extract token string from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Not authorized, no token provided'
      });
    }

    // Verify the token cryptographic signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach authenticated userId and userRole to request object for downstream handlers
    req.userId = decoded.userId;
    req.userRole = decoded.role || 'user';

    // Proceed to next middleware or route controller
    next();
  } catch (error) {
    console.error(`JWT Verification Error: ${error.message}`);

    // Return HTTP 401 for invalid, malformed, or expired tokens
    return res.status(401).json({
      message: 'Not authorized, invalid token'
    });
  }
};

module.exports = protect;
module.exports.protect = protect;
