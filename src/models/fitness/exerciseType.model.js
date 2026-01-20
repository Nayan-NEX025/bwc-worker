import mongoose from "mongoose";

const exerciseTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const ExerciseType = mongoose.model("ExerciseType", exerciseTypeSchema);

export default ExerciseType;
