import mongoose from "mongoose";

const muscleSchema = new mongoose.Schema(
  {
    muscleName: {
      type: String,
      required: true,
      trim: true,
    },
    targetMuscleImage: {
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },
    muscleThumbnailImage: {
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export const Muscle = mongoose.model("Muscle", muscleSchema);
