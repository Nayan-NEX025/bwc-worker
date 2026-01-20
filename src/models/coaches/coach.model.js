import mongoose, { Schema } from "mongoose";
import { STATUS, STATUS_VALUES } from "../../constants/enums/common.enum.js";
import {
  SUBSCRIPTION_STATUS_VALUES,
  SUBSCRIPTION_STATUS,
} from "../../constants/enums/index.js";

const coachSchema = new Schema(
  {
    // 🔐 Identity
    auth: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters"],
      maxlength: [50, "Full name cannot exceed 50 characters"],
    },

    // 🛡️ Coach lifecycle (ADMIN CONTROLLED)
    status: {
      type: String,
      enum: STATUS_VALUES, // active | inactive | blocked
      default: STATUS.INACTIVE,
      index: true,
    },

    // 💳 Billing (SYSTEM CONTROLLED)
    stripeCustomerId: {
      type: String,
      unique: true,
      sparse: true, // allows null
      index: true,
    },
    subscriptionStatus: {
      // as cached state
      type: String,
      enum: SUBSCRIPTION_STATUS_VALUES,
      default: SUBSCRIPTION_STATUS.INACTIVE,
    },

    activeSubscription: {
      // as pointer
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },

    // 🧠 Business constraints (OPTIONAL but future-proof)
    maxClients: {
      type: Number,
      default: 10,
    },

    currentClients: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

coachSchema.index({
  status: 1,
  subscriptionStatus: 1,
});
const Coach = mongoose.model("Coach", coachSchema);

export default Coach;
