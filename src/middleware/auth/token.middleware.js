import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../../configs/env.js";
import Auth from "../../models/auth/auth.model.js";
import ApiError from "../../utils/error/ApiError.js";

export const verifyToken = async (req, res, next) => {
  const token =
    req.cookies?.access_token ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    const user = await Auth.findById(decoded.authId).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError("Invalid or expired token", 401);
    }

    req.auth = decoded; // JWT payload {authId, email, role}
    req.user = user; // Auth document {_id, email, role}
    next();
  } catch (error) {
    throw new ApiError("Invalid or expired token", 401);
  }
};

// req.auth = decoded;      // token info | JWT payload, Security logic can use req.auth
// req.user = userAuth;    // Auth document | DB document,  Controllers only use req.user

//Optional Authentication: For routes where authentication is not mandatory.
// For routes that must work for both logged-in and logged-out users. [main use is that logged out user also get access to the route without authentication ]
// If cookie is present attached the user to the request if not present then it will proceed as an unauthenticated user
export const optionalVerifyToken = async (req, res, next) => {
  const token =
    req.cookies?.access_token ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    // No token provided, proceed as an unauthenticated user
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = await Auth.findById(decoded.authId).select(
      "-password -refreshToken"
    );

    if (!user) {
      // Invalid user associated with the token
      req.user = null;
      return next();
    }

    // Valid token and user found
    req.user = user;
    next();
  } catch (err) {
    // Token verification failed, proceed as an unauthenticated user
    req.user = null;
    next();
  }
};
