import ApiError from "../../../utils/error/ApiError.js";
import { stripe } from "../../payments/stripe/configs/stripeClient.config.js";
import {
  createStripeSubscription,
  getOrCreateStripeCustomer,
} from "../../payments/stripe/services/stripe.service.js";
import Plan from "../../plans/models/plan.model.js";
import Subscription from "../models/subscription.model.js";

export const createSubscription = async ({ ownerId, ownerRole, planId }) => {
  // 1️⃣ Validate plan
  const plan = await Plan.findOne({
    _id: planId,
    isActive: true,
  });
  if (!plan) {
    throw new ApiError("Plan not found or inactive", 404);
  }

  // 2️⃣ Prevent duplicate active subscription
  const existing = await Subscription.findOne({
    ownerId,
    status: "active",
  });

  if (existing) {
    throw new ApiError("Active subscription already exists", 400);
  }

  // 3️⃣ Create / reuse Stripe customer OPTIMIZATION
  const stripeCustomerId = await getOrCreateStripeCustomer({
    ownerId,
    ownerRole,
  });

  // 4️⃣ Create Stripe subscription
  const stripeSubscription = await createStripeSubscription({
    customerId: stripeCustomerId,
    priceId: plan.monthlyPriceId, // currently only monthly using
  });

  console.log(stripeSubscription);

  const paymentIntent = stripeSubscription.latest_invoice?.payment_intent;

  const clientSecret = paymentIntent?.client_secret;

  // 5️⃣ Save subscription locally (incomplete)
  const subscription = await Subscription.create({
    ownerId,
    ownerRole,
    planId: plan._id,

    stripeCustomerId,
    stripeSubscriptionId: stripeSubscription.id,

    status: "incomplete",
    currentPeriodStart: stripeSubscription.current_period_start
      ? new Date(stripeSubscription.current_period_start * 1000)
      : null,
    currentPeriodEnd: stripeSubscription.current_period_end
      ? new Date(stripeSubscription.current_period_end * 1000)
      : null,

    metadata: ownerRole === "coach" ? { clientCapUsed: 0 } : undefined,
    clientSecret,
  });

  return subscription;
};

export const createSubscriptionCheckout = async ({
  ownerId,
  ownerRole,
  planId,
  email,
  billingCycle,
}) => {
  // 1️⃣ Validate plan
  const plan = await Plan.findOne({ _id: planId, isActive: true });
  if (!plan) {
    throw new ApiError("Plan not found or inactive", 404);
  }

  // 2️⃣ Prevent duplicate active subscription
  const existing = await Subscription.findOne({
    ownerId,
    status: { $in: ["active", "trialing"] },
  });

  if (existing) {
    throw new ApiError("Active subscription already exists", 400);
  }

  // 3️⃣ Get or create Stripe customer
  const stripeCustomerId = await getOrCreateStripeCustomer({
    ownerId,
    ownerRole,
    email,
  });

  console.log("stripeCustomerId:", stripeCustomerId);

  const priceId =
    billingCycle === "yearly" ? plan.yearlyPriceId : plan.monthlyPriceId;

  // 4️⃣ Create Checkout Session (SUBSCRIPTION MODE)
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],

    success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,

    metadata: {
      ownerId: ownerId.toString(),
      ownerRole,
      planId: planId.toString(),
    },
  });

  // 5️⃣ Create local subscription (PENDING)
  await Subscription.create({
    ownerId,
    ownerRole,
    planId,
    stripeCustomerId,
    stripeCheckoutSessionId: session.id,
    status: "pending", // 🔑 important
    metadata: ownerRole === "coach" ? { clientCapUsed: 10 } : undefined,
  });

  return {
    checkoutUrl: session.url,
  };
};
