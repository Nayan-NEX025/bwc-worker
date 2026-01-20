import mongoose from "mongoose";

const experienceLevelSchema = new mongoose.Schema(
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

const ExperienceLevel = mongoose.model(
  "ExperienceLevel",
  experienceLevelSchema
);

export default ExperienceLevel;
