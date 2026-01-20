import Coach from "../../../../models/coaches/coach.model.js";
import User from "../../../../models/users/user.model.js";
import Subscription from "../../../subscriptions/models/subscription.model.js";

// checkout.session.completed
// Source of truth for subscription activation
export const handleCheckoutCompleted = async (session) => {
  console.log("checkout session: ", session);
  if (session.mode !== "subscription") return;

  console.log("✅ Checkout completed:", session.id); // will get the checkout session id for the subscription that user created

  const subscription = await Subscription.findOneAndUpdate(
    { stripeCheckoutSessionId: session.id },
    {
      stripeSubscriptionId: session.subscription,
      status: "active",
    },
    { new: true }
  );

  if (!subscription) return;

  // 2️⃣ Activate account based on role
  switch (subscription.ownerRole) {
    case "user":
      await User.findOneAndUpdate(
        { auth: subscription.ownerId },
        {
          status: "active",
          subscriptionStatus: "active",
          activeSubscription: subscription._id,
        }
      );
      break;

    case "coach":
      await Coach.findOneAndUpdate(
        { auth: subscription.ownerId },
        {
          status: "active",
          subscriptionStatus: "active",
          activeSubscription: subscription._id,
        }
      );
      break;

    default:
      console.warn("Unknown subscription ownerRole:", subscription.ownerRole);
  }
};

/**
 * customer.subscription.updated
 */
// export const handleSubscriptionUpdated = async (subscription) => {
//   console.log("🔄 Subscription updated:", subscription.id);

//   await Subscription.findOneAndUpdate(
//     { stripeSubscriptionId: subscription.id },
//     {
//       status: subscription.status,
//       currentPeriodEnd: new Date(subscription.current_period_end * 1000),
//     }
//   );
// };

// /**
//  * customer.subscription.deleted
//  */
// export const handleSubscriptionDeleted = async (subscription) => {
//   console.log("❌ Subscription canceled:", subscription.id);

//   await Subscription.findOneAndUpdate(
//     { stripeSubscriptionId: subscription.id },
//     {
//       status: "canceled",
//       canceledAt: new Date(),
//     }
//   );
// };

// /**
//  * invoice.payment_succeeded
//  */
// export const handlePaymentSucceeded = async (invoice) => {
//   console.log("✅ Payment succeeded:", invoice.id);

//   await Subscription.findOneAndUpdate(
//     { stripeSubscriptionId: invoice.subscription },
//     { status: "active" }
//   );
// };

// /**
//  * invoice.payment_failed
//  */
// export const handlePaymentFailed = async (invoice) => {
//   console.log("❌ Payment failed:", invoice.id);

//   await Subscription.findOneAndUpdate(
//     { stripeSubscriptionId: invoice.subscription },
//     { status: "past_due" }
//   );
// };

// user status will be inactive on subscription cancel
