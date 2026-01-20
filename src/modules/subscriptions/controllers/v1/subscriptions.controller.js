import ApiError from "../../../../utils/error/ApiError.js";
import * as subscriptionService from "../../services/subscription.service.js";

export const createSubscriptionCheckout = async (req, res) => {
  const ownerId = req.user?._id || "694520628bcf7e717784f3b3";
  const ownerRole = req.user?.role || "coach";
  const email = req.user?.email || "email2@locallhost.com";

  const { planId, billingCycle } = req.body || {};

  const result = await subscriptionService.createSubscriptionCheckout({
    ownerId,
    ownerRole,
    planId,
    email,
    billingCycle
  });

  return res.status(201).json({
    success: true,
    message: "Checkout session created",
    data: result,
  });
};

// coach subscriptions status get updated through stripe webhook - checkout.session.completed
