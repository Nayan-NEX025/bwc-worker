import mongoose from "mongoose";

const emailSchema = new mongoose.Schema(
  {
    to: { type: String, required: true },
    subject: String,

    resendId: { type: String, index: true },

    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailCampaign",
      index: true,
    },
    type: {
      type: String,
      enum: ["transactional", "campaign"],
    },
    status: {
      type: String,
      enum: [
        "queued",
        "sent",
        "delivered",
        "opened",
        "clicked",
        "failed",
        "complained",
        "bounced",
        "scheduled",
        "processing",
      ],
      default: "queued",
    },

    module: {
      type: String, // auth, workouts, payments, etc.
    },

    meta: mongoose.Schema.Types.Mixed,
    error: String,
    sentAt: Date,
    deliveredAt: Date,
    openedAt: Date,
    clickedAt: Date,
    failedAt: Date,
    complainedAt: Date,

    openMeta: Object,
    clickMeta: Object,
  },
  { timestamps: true },
);

const Email = mongoose.model("Email", emailSchema);

export default Email;
