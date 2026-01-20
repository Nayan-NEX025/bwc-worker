import { STRIPE_WEBHOOK_SECRET } from "../../../../configs/env.js";
import ApiError from "../../../../utils/error/ApiError.js";
import { stripe } from "../configs/stripeClient.config.js";
import * as webhookHandlers from "./stripe.webhook.handlers.js";

export const handleStripeWebhook = (req, res) => {
  let event;
  if (STRIPE_WEBHOOK_SECRET) {
    // Get the signature send by strip
    const signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      throw new ApiError(`Webhook Error: ${err.message}`, 400);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        console.log("✅ Checkout completed");
        webhookHandlers.handleCheckoutCompleted(event.data.object);
        break;

      case "customer.subscription.created":
        console.log("✅ Subscription created");
        // handleSubscriptionCreated(event.data.object);
        break;

      case "customer.subscription.updated":
        console.log("🔄 Subscription updated");
        // handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        console.log("❌ Subscription canceled");
        // handleSubscriptionDeleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        console.log("✅ Payment succeeded");
        // handlePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        console.log("❌ Payment failed");
        // handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`ℹ️ Ignored Stripe event: ${event.type}`);
    }

    res.json({ received: true });
  }
};

// invoice.paid , invoice.created , payment_intent.succeeded, payment_intent.payment_failed
