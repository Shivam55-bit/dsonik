const authorize = (...roles) => {
  // Handle direct middleware usage: admin(req, res, next)
  if (roles.length > 0 && roles[0] && typeof roles[0] === 'object' && typeof roles[2] === 'function') {
    const req = roles[0];
    const res = roles[1];
    const next = roles[2];
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized, authentication required'
      });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    return next();
  }

  // Handle factory usage: authorize('admin', 'superadmin')
  const allowedRoles = roles.length > 0 ? roles.flat() : ['admin', 'superadmin'];
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized, authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

authorize.authorize = authorize;

module.exports = authorize;
