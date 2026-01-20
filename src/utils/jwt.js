import jwt from "jsonwebtoken";
import { TOKEN_TYPES } from "../constants/enums/token.enum.js";
import {
  ACCESS_TOKEN_EXPIRY,
  EMAIL_VERIFICATION_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from "../configs/env.js";

export const getJwtOptions = (type) => {
  switch (type) {
    case TOKEN_TYPES.ACCESS:
      return {
        expiresIn: ACCESS_TOKEN_EXPIRY,
      };

    case TOKEN_TYPES.REFRESH:
      return {
        expiresIn: REFRESH_TOKEN_EXPIRY,
      };

    case TOKEN_TYPES.VERIFY_EMAIL:
      return {
        expiresIn: EMAIL_VERIFICATION_EXPIRY,
      };

    case TOKEN_TYPES.RESET_PASSWORD:
      return {
        expiresIn: EMAIL_VERIFICATION_EXPIRY,
      };

    default:
      throw new Error("Invalid token type");
  }
};

export const generateToken = (payload, secret, type) => {
  return jwt.sign(payload, secret, getJwtOptions(type));
};
