import mongoose, { Schema } from "mongoose";
import {
  COACH_APPROVAL_STATUS,
  COACH_APPROVAL_VALUES,
} from "../../constants/enums/index.js";

const coachClientSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", //  DOMAIN MODEL
      required: true,
    },
    coach: {
      type: Schema.Types.ObjectId,
      ref: "Coach", //  DOMAIN MODEL
      required: true,
    },
    status: {
      type: String,
      enum: COACH_APPROVAL_VALUES,
      default: COACH_APPROVAL_STATUS.PENDING,
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Apply this index ONLY to documents that match this condition.
coachClientSchema.index(
  { user: 1, coach: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } } // blocks duplicate pending requests
);

const CoachClient = mongoose.model("CoachClient", coachClientSchema);

export default CoachClient;
