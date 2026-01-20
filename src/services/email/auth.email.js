import { enqueueEmail } from "../../modules/email/email.producer.js";

export const sendForgotPasswordOTPEmail = async ({ email, name, otp }) => {
  return enqueueEmail({
    to: email,
    subject: "Your password reset OTP",
    module: "auth",
    meta: { name, otp, expiresIn: "5 minutes" },
    template: "forgot-password-otp",
  });
};

export const sendSignupOTPEmail = async ({ email, name, otp }) => {
  return enqueueEmail({
    to: email,
    subject: "Your signup OTP",
    module: "auth",
    meta: { name, otp, expiresIn: "15 minutes" },
    template: "signup-otp",
  });
};
