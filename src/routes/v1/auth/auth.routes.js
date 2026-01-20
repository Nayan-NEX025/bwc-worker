import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  googleAuth,
  login,
  logout,
  refreshAccessToken,
  resetPassword,
  signUpCoach,
  signUpUser,
  verifyOtp,
} from "../../../controllers/v1/auth/auth.controller.js";
import { verifyToken } from "../../../middleware/auth/token.middleware.js";

const router = Router();

router.route("/signup/coach").post(signUpCoach);
router.route("/signup/user").post(signUpUser);
router.route("/login").post(login);
router.route("/logout").post(verifyToken, logout);
router.route("/refresh").post(verifyToken, refreshAccessToken);
router.route("/forgot-password").post(forgotPassword); // forgot -> verify OTP -> reset password
router.route("/reset-password").post(resetPassword);
router.route("/verify-otp").post(verifyOtp);
router.route("/change-password").post(verifyToken, changePassword);
router.route("/google").post(googleAuth);

export default router;
