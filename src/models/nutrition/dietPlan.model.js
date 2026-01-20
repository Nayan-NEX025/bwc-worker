import mongoose, { Schema } from "mongoose";
import { DIET_UNIT_VALUES } from "../../constants/enums/index.js";

const dietPlanItemSchema = new Schema({
  ingredient: {
    type: Schema.Types.ObjectId,
    ref: "Ingredient",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    enum: DIET_UNIT_VALUES,
    required: true,
  },
  note: {
    type: String,
    trim: true,
    maxLength: [200, "Note cannot exceed 200 characters."],
  },
});

const dietPanSectionSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: [100, "Section name cannot exceed 100 characters."],
    minLength: [3, "Section name must be at least 3 characters long."],
  },
  items: {
    type: [dietPlanItemSchema],
    default: [],
  },
});

const dietPlanSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: [100, "Name cannot exceed 100 characters."],
      minLength: [3, "Name must be at least 3 characters long."],
    },
    mainGoal: {
      type: String,
      required: true,
      trim: true,
      maxLength: [100, "Main goal cannot exceed 100 characters."],
      minLength: [3, "Main goal must be at least 3 characters long."],
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
    notes: {
      type: String,
      trim: true,
      maxLength: [500, "Notes cannot exceed 1000 characters."],
    },
    supplement: {
      type: Schema.Types.ObjectId,
      ref: "Supplement",
    },
    sections: {
      type: [dietPanSectionSchema],
      //   required: true,
    },
  },
  { timestamps: true }
);

const DietPlan = mongoose.model("DietPlan", dietPlanSchema);

export default DietPlan;
