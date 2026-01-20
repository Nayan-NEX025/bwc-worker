import { Router } from "express";
import stripeWebhookRoutes from "../../../modules/payments/stripe/routes/v1/index.js";
import handleResendRoutes from "../../../modules/email/email.routes.js";

const router = Router();

router.use("/stripe", stripeWebhookRoutes);
router.use("/resend", handleResendRoutes);

export default router;
