import { Router } from "express";
import { handleResendWebhook } from "./resend.webhook.js";

const router = Router();

router.route("/").post(handleResendWebhook);

export default router;
