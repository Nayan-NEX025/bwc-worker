import mongoose, { Schema } from "mongoose";

const planSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    targetRole: {
      type: String,
      enum: ["coach", "user"], //  Who this plan is for
      required: true,
      index: true,
    },
    planTag: {
      type: String,
    },
    clientCap: {
      type: Number,
      required: function () {
        return this.targetRole === "coach";
      },
    },
    stripeProductId: {
      type: String,
      required: true,
    },

    monthlyPriceId: {
      type: String,
      required: true,
    },

    yearlyPriceId: {
      type: String,
    },

    monthlyAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    yearlyAmount: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: "usd",
    },
    // 🔹 Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // 🔹 Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth", // admin account
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth", // admin account
      required: true,
    },
  },
  { timestamps: true }
);

export const Plan = mongoose.model("Plan", planSchema);

export default Plan;
