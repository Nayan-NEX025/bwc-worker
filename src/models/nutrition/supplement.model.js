import mongoose, { Schema } from "mongoose";
import { STATUS_VALUES, STATUS } from "../../constants/enums/index.js";

const supplementSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, "Description cannot exceed 500 characters."],
      minLength: [10, "Description must be at least 10 characters long."],
    },
    image: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: STATUS.ACTIVE,
      index: true,
    },
  },
  { timestamps: true }
);

const Supplement = mongoose.model("Supplement", supplementSchema);

export default Supplement;
