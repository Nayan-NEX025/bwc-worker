import { JWT_SECRET, REFRESH_TOKEN_SECRET } from "../../../configs/env.js";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "../../../constants/cookies/auth.cookies.js";
import { OTP_TYPES } from "../../../constants/enums/index.js";
import { ROLES } from "../../../constants/enums/roles.enum.js";
import { TOKEN_TYPES } from "../../../constants/enums/token.enum.js";
import { getDisplayNameByAuth } from "../../../helpers/getDisplayName.helper.js";
import Auth from "../../../models/auth/auth.model.js";
import Coach from "../../../models/coaches/coach.model.js";
import User from "../../../models/users/user.model.js";
import ApiError from "../../../utils/error/ApiError.js";
import { hashPassword } from "../../../utils/hash.js";
import { generateToken } from "../../../utils/jwt.js";
import jwt from "jsonwebtoken";
import { generateOTP } from "../../../utils/otp.js";
import {
  sendForgotPasswordOTPEmail,
  sendSignupOTPEmail,
} from "../../../services/email/index.js";
import {
  deleteOTP,
  saveOTP,
  verifyOTP,
} from "../../../services/otp/otp.service.js";
import { googleAuthService } from "../../../services/auth/googleAuth.service.js";

export const signUpCoach = async (req, res) => {
  const { fullName, email, phoneNumber, password } = req.body;
  const exists = await Auth.findOne({ $or: [{ email }, { phoneNumber }] });
  if (exists) throw new ApiError("Email or phone number already exists", 409);

  const auth = await Auth.create({
    email,
    phoneNumber,
    password,
    role: ROLES.COACH,
    isEmailVerified: false,
  });

  // 7. Create coach without subscription
  await Coach.create({
    auth: auth._id,
    fullName,
    subscriptionStatus: "inactive",
  });

  // 🔐 Generate Signup OTP
  const otp = generateOTP();
  console.log("OTP: ", otp);
  await saveOTP(OTP_TYPES.SIGNUP_EMAIL, email, otp, 15 * 60); // 15 mins

  // 📧 Send OTP Email
  await sendSignupOTPEmail({
    email,
    name: fullName,
    otp,
  });

  return res.status(201).json({
    success: true,
    message: "Coach registered. Please verify email & choose a plan.",
    otp: `${otp} - For testing only to verify email`,
  });
};

export const signUpUser = async (req, res) => {
  const { fullName, email, phoneNumber, password } = req.body;

  const exists = await Auth.findOne({ $or: [{ email }, { phoneNumber }] });
  if (exists) throw new ApiError("Email or phone number already exists", 409);

  const auth = await Auth.create({
    email,
    phoneNumber,
    password,
    role: ROLES.USER,
    isEmailVerified: false,
  });

  // Create User
  const user = await User.create({
    auth: auth._id,
    fullName,
  });

  // 🔐 Generate Signup OTP
  const otp = generateOTP();
  console.log("OTP: ", otp);

  // Save OTP to redis
  await saveOTP(OTP_TYPES.SIGNUP_EMAIL, email, otp, 15 * 60); // 15 mins

  // 📧 Send OTP Email
  await sendSignupOTPEmail({
    email,
    name: fullName,
    otp,
  });

  return res.status(201).json({
    success: true,
    message:
      "Signup successful. Please verify your email to activate your account.",
    otp: `${otp} - For testing only to verify email`,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError("Email and password are required", 400);
  }
  const auth = await Auth.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!auth) throw new ApiError("Invalid credentials", 401);
  if (!auth.isEmailVerified) {
    throw new ApiError("Please verify your email address first", 401);
  }

  const isPasswordValid = await auth.comparePassword(password);
  if (!isPasswordValid) throw new ApiError("Invalid credentials", 401);

  const accessToken = auth.generateAccessToken();
  const refreshToken = auth.generateRefreshToken();
  auth.lastLoginAt = new Date();
  auth.refreshToken = refreshToken;
  await auth.save();

  return res
    .cookie("access_token", accessToken, ACCESS_TOKEN_COOKIE)
    .cookie("refresh_token", refreshToken, REFRESH_TOKEN_COOKIE)
    .status(200)
    .json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: auth._id,
          email: auth.email,
          role: auth.role,
        },
        tokens: {
          accessToken,
          refreshToken, // mobile apps will use this
        },
      },
    });
};

export const logout = async (req, res) => {
  if (!req.user) {
    throw new ApiError("Unauthorized", 401);
  }

  const auth = await Auth.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  if (!auth) {
    throw new ApiError("Unauthorized", 401);
  }
  return res
    .clearCookie("access_token", ACCESS_TOKEN_COOKIE)
    .clearCookie("refresh_token", REFRESH_TOKEN_COOKIE)
    .status(200)
    .json({
      success: true,
      message: "Logout successful",
    });
};

export const refreshAccessToken = async (req, res) => {
  const clientRefreshToken = req.cookies.refresh_token;
  if (!clientRefreshToken) {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    throw new ApiError("Session expired. Please log in again", 403); // Expired or Invalid Refresh Token. force the user to log out in front end and login again
  }
  try {
    const decoded = jwt.verify(clientRefreshToken, REFRESH_TOKEN_SECRET);

    const auth = await Auth.findById(decoded?._id);
    if (!auth || clientRefreshToken !== auth?.refreshToken) {
      res.clearCookie("access_token");
      res.clearCookie("refresh_token");
      throw new ApiError("Refresh token expired", 401);
    }
    const accessToken = auth.generateAccessToken();
    const refreshToken = auth.generateRefreshToken();

    auth.refreshToken = refreshToken;
    await auth.save({ validateBeforeSave: false });

    return res
      .status(200)
      .cookie("access_token", accessToken, ACCESS_TOKEN_COOKIE)
      .cookie("refresh_token", refreshToken, REFRESH_TOKEN_COOKIE)
      .json({ success: true, message: "Access token refreshed" });
  } catch (error) {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    throw new ApiError("Invalid refresh token", 401);
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new ApiError("Verification token is required", 400);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);
  } catch (err) {
    throw new ApiError("Invalid or expired verification token", 400);
  }

  // Optional safety check
  if (decoded.type !== TOKEN_TYPES.VERIFY_EMAIL) {
    throw new ApiError("Invalid verification token type", 400);
  }

  const auth = await Auth.findOne({ email: decoded.email });

  if (!auth) {
    throw new ApiError("User not found", 404);
  }

  if (auth.isEmailVerified) {
    return res.status(200).json({
      success: true,
      message: "Email already verified",
    });
  }

  auth.isEmailVerified = true;
  await auth.save();

  return res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError("Email is required", 400);
  }

  const auth = await Auth.findOne({ email });
  if (!auth) {
    throw new ApiError("User not found", 404);
  }

  const otp = generateOTP();
  await saveOTP(OTP_TYPES.RESET_PASSWORD, email, otp, 5 * 60); // 5 mins

  const name = await getDisplayNameByAuth(auth);

  await sendForgotPasswordOTPEmail({ email, name, otp });

  return res.status(200).json({
    success: true,
    message: "OTP sent to registered email",
  });
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ApiError("Email and OTP are required", 400);
  }
  const auth = await Auth.findOne({ email });
  if (!auth) {
    throw new ApiError("User not found", 404);
  }
  const otpData = await verifyOTP(email, otp);
  if (!otpData) {
    throw new ApiError("Invalid or expired OTP", 400);
  }

  await deleteOTP(email);

  if (otpData.type === OTP_TYPES.SIGNUP_EMAIL) {
    auth.isEmailVerified = true;
    await auth.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  }
  if (otpData.type === OTP_TYPES.RESET_PASSWORD) {
    const resetToken = generateToken(
      { authId: auth._id, type: TOKEN_TYPES.RESET_PASSWORD },
      JWT_SECRET,
      TOKEN_TYPES.RESET_PASSWORD
    );

    return res.status(200).json({
      success: true,
      resetToken,
      message: "OTP verified",
    });
  }

  throw new ApiError("Invalid OTP type", 400);
};

export const resetPassword = async (req, res) => {
  const { resetToken, newPassword, confirmPassword } = req.body;
  if (!resetToken || !newPassword || !confirmPassword) {
    throw new ApiError("Token and password are required", 400);
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError("Passwords do not match", 400);
  }

  let decoded;
  try {
    decoded = jwt.verify(resetToken, JWT_SECRET);
    console.log("decoded: ", decoded);
  } catch (err) {
    throw new ApiError("Invalid or expired token", 400);
  }
  if (decoded.type !== TOKEN_TYPES.RESET_PASSWORD) {
    throw new ApiError("Invalid token type", 400);
  }

  const auth = await Auth.findById(decoded.authId);
  if (!auth) {
    throw new ApiError("User not found", 404);
  }

  auth.password = newPassword;
  auth.refreshToken = undefined;
  auth.passwordChangedAt = new Date();
  await auth.save();

  return res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError("All password fields are required", 400);
  }
  if (newPassword !== confirmPassword) {
    throw new ApiError("Passwords do not match", 400);
  }

  const auth = await Auth.findById(req.user._id).select("+password");
  if (!auth) {
    throw new ApiError("User not found", 404);
  }
  const isMatch = await auth.comparePassword(currentPassword, auth.password);
  if (!isMatch) {
    throw new ApiError("Current password is incorrect", 400);
  }

  auth.password = newPassword;
  auth.refreshToken = undefined;
  auth.passwordChangedAt = new Date();
  await auth.save();
  return res.status(200).json({
    success: true,
    message: "Password changed successfully. Please log in again.",
  });
};

export const googleAuth = async (req, res) => {
  const result = await googleAuthService(req.body);

  return res
    .status(200)
    .cookie("access_token", result.tokens.accessToken, result.cookies.access)
    .cookie("refresh_token", result.tokens.refreshToken, result.cookies.refresh)
    .json({
      success: true,
      message: "Google authentication successful",
      user: result.user,
      tokens: {
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      },
    });
};
