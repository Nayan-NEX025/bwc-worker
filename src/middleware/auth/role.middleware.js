import ApiError from "../../utils/error/ApiError.js";

export const authorizeRoles = (roles = []) => {
  return (req, res, next) => {
    if (!req.auth) {
      return next(new ApiError("Unauthorized request", 401));
    }
    if (roles.includes(req.auth?.role)) {
      next();
    } else {
      return next(new ApiError("Access denied", 403));
    }
  };
};

// Middleware to set role in request context
export const setRoleContext = (role) => {
  return (req, _res, next) => {
    if (!role) {
      throw new ApiError("Role is required", 500); // dev/config error
    }
    req.context = req.context || {};
    req.context.role = role;

    next();
  };
};

// optional authorize roles middleware
export const optionalAuthorizeRoles = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }
    if (roles.includes(req.user?.role)) {
      next();
    } else {
      return next(new ApiError("Access denied", 403));
    }
  };
};
