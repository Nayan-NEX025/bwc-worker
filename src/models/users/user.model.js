import mongoose, { Schema } from "mongoose";
import {
  STATUS,
  STATUS_VALUES,
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_STATUS_VALUES,
} from "../../constants/enums/index.js";

const userSchema = new Schema(
  {
    auth: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    coach: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      default: null,
    },
    coachStatus: {
      type: String,
      enum: ["none", "pending", "active", "rejected"], // active means approved
      default: "none",
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters"],
      maxlength: [50, "Full name cannot exceed 50 characters"],
    },
    status: {
      type: String,
      enum: STATUS_VALUES, // active | inactive | blocked
      default: STATUS.INACTIVE,
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
    stripeCustomerId: {
      type: String,
      unique: true,
      sparse: true, // allows null
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const User = mongoose.model("User", userSchema);

export default User;
