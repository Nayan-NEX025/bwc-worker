import mongoose, { Schema } from "mongoose";
import { STATUS_VALUES, STATUS } from "../../constants/enums/index.js";

const ingredientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      maxLength: [100, "Name cannot exceed 100 characters."],
      minLength: [3, "Name must be at least 3 characters long."],
    },

    amountPer: {
      value: { type: Number, required: true }, // amount number
      unit: { type: String, enum: ["g", "ml", "piece"], default: "g" },
    },

    protein: {
      type: Number, // grams
      required: true,
      min: 0,
    },

    carbs: {
      type: Number, // grams
      required: true,
      min: 0,
    },

    fat: {
      type: Number, // grams
      required: true,
      min: 0,
    },

    calories: {
      type: Number, // grams
      required: true,
      min: 0,
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

const Ingredient = mongoose.model("Ingredient", ingredientSchema);

export default Ingredient;
