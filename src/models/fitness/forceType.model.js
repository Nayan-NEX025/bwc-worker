import mongoose from "mongoose";

const forceTypeSchema = new mongoose.Schema(
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

const ForceType = mongoose.model("ForceType", forceTypeSchema);

export default ForceType;
