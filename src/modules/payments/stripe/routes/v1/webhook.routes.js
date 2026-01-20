import express, { Router } from "express";
import { handleStripeWebhook } from "../../webhook/stripe.webhook.controller.js";

const router = Router();

router.route("/").post(handleStripeWebhook);

export default router;
