// Middleware to check whether the authenticated user possesses the 'admin' role
const adminMiddleware = (req, res, next) => {
  // Check if req.userRole was set by the protect middleware and equals 'admin'
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      message: 'Admin access required'
    });
  }

  // User is authorized as admin, proceed to downstream route handler
  next();
};

module.exports = adminMiddleware;
module.exports.adminMiddleware = adminMiddleware;
