import {
  ACCESS_TOKEN_SECRET,
  GOOGLE_CLIENT_ID,
  REFRESH_TOKEN_SECRET,
} from "../../configs/env.js";
import { googleOAuthClient } from "../../configs/google.config.js";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "../../constants/cookies/auth.cookies.js";
import { ROLES, TOKEN_TYPES } from "../../constants/enums/index.js";
import Auth from "../../models/auth/auth.model.js";
import AuthProvider from "../../models/auth/authPorvider.js";
import Coach from "../../models/coaches/coach.model.js";
import User from "../../models/users/user.model.js";
import ApiError from "../../utils/error/ApiError.js";
import { generateToken } from "../../utils/jwt.js";

export const googleAuthService = async ({ idToken, role }) => {
  if (![ROLES.USER, ROLES.COACH].includes(role)) {
    throw new ApiError("Role is required", 400);
  }

  if (!idToken) {
    throw new ApiError("Google ID token required", 400);
  }

  const ticket = await googleOAuthClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  console.log("ticket: ", ticket);

  const payload = ticket.getPayload();
  console.log("payload: ", payload);

  if (!payload) {
    throw new ApiError("Invalid Google ID token", 400);
  }

  const { email, name, sub: googleUserId, email_verified } = payload;
  if (!email_verified) {
    throw new ApiError("Google email not verified", 400);
  }

  let providerAuth = await AuthProvider.findOne({
    provider: "google",
    providerUserId: googleUserId,
  }).populate("auth", "-__v");

  let auth;
  if (providerAuth) {
    // existing user via Google
    auth = providerAuth.auth;
  } else {
    // new user via Google
    auth = await Auth.findOne({ email }); // check if email exists in DB means user signed up via normal method
  }

  // Case 3:Link Google provider if user exists but provider is missing
  if (auth && !providerAuth) {
    await AuthProvider.create({
      auth: auth._id,
      provider: "google",
      providerUserId: googleUserId,
    });
  }

  if (!auth) {
    // completely new user via Google
    const newUser = await Auth.create({
      email,
      isEmailVerified: true,
      role,
    });

    if (role === ROLES.COACH) {
      await Coach.create({ auth: newUser._id, fullName: name });
    }
    if (role === ROLES.USER) {
      await User.create({ auth: newUser._id, fullName: name });
    }

    await AuthProvider.create({
      // link Google provider
      auth: newUser._id,
      provider: "google",
      providerUserId: googleUserId,
    });

    auth = newUser;
  }

  // already existing user (normal signup or Google signup)
  const accessToken = generateToken(
    { authId: auth._id },
    ACCESS_TOKEN_SECRET,
    TOKEN_TYPES.ACCESS
  );

  const refreshToken = generateToken(
    { authId: auth._id },
    REFRESH_TOKEN_SECRET,
    TOKEN_TYPES.REFRESH
  );

  return {
    user: auth,
    tokens: {
      accessToken,
      refreshToken,
    },
    cookies: {
      access: ACCESS_TOKEN_COOKIE,
      refresh: REFRESH_TOKEN_COOKIE,
    },
  };
};
