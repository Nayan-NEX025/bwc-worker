import mongoose from "mongoose";

export const InstructionSchema = new mongoose.Schema(
  {
    stepId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
      index: true,
    },
    stepNumber: {
      type: Number,
      required: true,
    },
    instruction: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);
