import mongoose from "mongoose";
import {
  ROLES,
  SUBSCRIPTION_STATUS_VALUES,
  SUBSCRIPTION_STATUS,
} from "../../../constants/enums/index.js";

const subscriptionSchema = new mongoose.Schema(
  {
    // 🔗 Who owns this subscription
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth", // single auth source (user / coach)
      required: true,
      index: true,
    },

    ownerRole: {
      type: String,
      enum: [ROLES.USER, ROLES.COACH], // USER | COACH
      required: true,
      index: true,
    },

    // 📦 Plan
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    // 💳 Stripe mapping
    stripeCustomerId: {
      type: String,
      required: true,
      index: true,
    },

    stripeSubscriptionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    stripeCheckoutSessionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    // 📊 Subscription state
    status: {
      type: String,
      enum: SUBSCRIPTION_STATUS_VALUES,
      default: SUBSCRIPTION_STATUS.INCOMPLETE,
      index: true,
    },

    currentPeriodStart: Date,
    currentPeriodEnd: Date,

    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },

    canceledAt: Date,

    // 🧠 Business metadata
    metadata: {
      // coach-only
      clientCapUsed: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// 🚫 Prevent multiple active subscriptions
subscriptionSchema.index(
  { ownerId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "active", // Only apply this index to documents where status === "active"”
    },
  }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
