import Email from "./email.model.js";
import { RESEND_WEBHOOK_SECRET } from "../../configs/env.js";
import resend from "../../configs/resend.config.js";
import ApiError from "../../utils/error/ApiError.js";
import * as webhookHandlers from "./resend.webhook.handlers.js";

export const handleResendWebhook = async (req, res) => {
  let event;

  // 1️⃣ Verify webhook signature
  try {
    event = resend.webhooks.verify({
      payload: req.body,
      headers: {
        id: req.headers["svix-id"],
        timestamp: req.headers["svix-timestamp"],
        signature: req.headers["svix-signature"],
      },
      webhookSecret: RESEND_WEBHOOK_SECRET,
    });
  } catch (err) {
    console.error("❌ Webhook verification failed", err);
    throw new ApiError("Invalid webhook signature", 400);
  }

  const { type, data, created_at } = event;

  console.log("📩 Resend webhook:", type);

  // 2️⃣ Route event to handler
  try {
    switch (type) {
      case "email.sent":
        console.log("✅ Email sent");
        await webhookHandlers.handleEmailSent(data);
        break;

      case "email.delivered":
        console.log("✅ Email delivered");
        await webhookHandlers.handleEmailDelivered(data);
        break;

      case "email.opened":
        console.log("✅ Email opened");
        await webhookHandlers.handleEmailOpened(data);
        break;

      case "email.clicked":
        console.log("✅ Email clicked");
        await webhookHandlers.handleEmailClicked(data);
        break;

      case "email.bounced": // rejection for mail server
      case "email.failed": // resend did not sent mail
        console.log("❌ Email failed");
        await webhookHandlers.handleEmailFailed(type, data);
        break;

      case "email.complained":
        console.log("❌ Email complained");
        await webhookHandlers.handleEmailComplained(data);
        break;

      default:
        console.log("⚠️ Unhandled event:", type);
    }
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    return res.status(500).json({ message: "Webhook processing failed" });
  }

  // 3️⃣ Always acknowledge webhook
  return res.sendStatus(200);
};
