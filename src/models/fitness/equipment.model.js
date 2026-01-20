import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    equipmentName: {
      type: String,
      required: true,
      trim: true,
    },
    targetEquipmentImage: {
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export const Equipment = mongoose.model("Equipment", equipmentSchema);
