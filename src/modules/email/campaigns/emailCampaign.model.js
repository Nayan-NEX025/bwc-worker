import mongoose from "mongoose";

const emailCampaignSchema = new mongoose.Schema(
  {
    // Human readable campaign name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Email subject line
    subject: {
      type: String,
      required: true,
    },

    content: {
      type: String,
    },

    recipientsType: {
      type: [String],
      enum: ["users", "coaches"],
      required: true,
      index: true,
    },

    // marketing | auth | payments | system
    module: {
      type: String,
      default: "marketing",
      index: true,
    },

    // Campaign lifecycle
    status: {
      type: String,
      enum: [
        "scheduled",
        "queued",
        "sending",
        "completed",
        "paused",
        "cancelled",
        "failed",
        "processing",
      ],
      default: "processing",
      index: true,
    },

    // Campaign scheduling
    scheduledAt: Date,
    startedAt: Date,
    completedAt: Date,

    // Aggregated stats (optional – can be derived)
    totalRecipients: {
      type: Number,
      default: 0,
    },

    // Who created the campaign (admin/system)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    // // Dynamic template data
    // meta: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  },
);

// Helpful indexes
emailCampaignSchema.index({ status: 1, createdAt: -1 });

const EmailCampaign = mongoose.model("EmailCampaign", emailCampaignSchema);

export default EmailCampaign;
