import mongoose from "mongoose";
import { POLICY_TYPE_VALUES } from "../../constants/enums/index.js";

const policySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: POLICY_TYPE_VALUES,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    version: {
      type: String, // v1.0, v1.1
      required: true,
    },

    content: {
      type: String, // HTML
      required: true,
    },

    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },

    activatedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

/**
 * Only ONE active policy per type
 */
policySchema.index(
  { type: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export const Policy = mongoose.model("Policy", policySchema);
