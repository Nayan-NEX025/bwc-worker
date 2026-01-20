import mongoose, { Schema } from "mongoose";
import { STATUS_VALUES, STATUS } from "../../constants/enums/index.js";

const recipeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      minLength: [3, "Name must be at least 3 characters long."],
      maxLength: [100, "Name cannot exceed 100 characters."],
    },
    description: {
      type: String,
      trim: true,
      minLength: [10, "Description must be at least 10 characters long."],
      maxLength: [500, "Description cannot exceed 500 characters."],
      required: true,
    },
    image: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "RecipeCategory",
      required: true,
    },
    prepTime: {
      hours: { type: Number, default: 0, min: 0 },
      minutes: { type: Number, default: 0, min: 0 },
    },

    cookTime: {
      hours: { type: Number, default: 0, min: 0 },
      minutes: { type: Number, default: 0, min: 0 },
    },

    servings: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: STATUS.ACTIVE,
      index: true,
    },
    ingredients: [
      {
        ingredient: {
          type: Schema.Types.ObjectId,
          ref: "Ingredient",
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        unit: {
          type: String,
          enum: ["g", "mg", "ml", "l", "tbsp", "tsp", "cup", "piece"],
          required: true,
        },
      },
    ],
    instructions: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
          maxLength: [1000, "Instruction cannot exceed 1000 characters."],
          minLength: [5, "Instruction must be at least 5 characters long."],
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "creatorModel",
      required: true,
    },
    creatorModel: {
      type: String,
      required: true,
      enum: ["Auth", "Coach"],
    },
  },
  { timestamps: true },
);

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
