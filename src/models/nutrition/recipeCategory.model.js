import mongoose, { Schema } from "mongoose";
import { STATUS_VALUES, STATUS } from "../../constants/enums/index.js";

const recipeCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      minLength: [3, "Category name must be at least 3 characters long"],
      maxLength: [50, "Category name must be at most 50 characters long"],
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

const RecipeCategory = mongoose.model("RecipeCategory", recipeCategorySchema);

export default RecipeCategory;
