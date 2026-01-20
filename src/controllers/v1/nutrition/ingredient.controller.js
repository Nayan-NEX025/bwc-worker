import { isValidObjectId } from "mongoose";
import Ingredient from "../../../models/nutrition/ingredient.model.js";
import ApiError from "../../../utils/error/ApiError.js";
import { getIngredientPipeline } from "../../../helpers/pipelines/ingredient.pipeline.js";
import { paginateWithAggregation } from "../../../utils/pagination.js";

export const createIngredient = async (req, res) => {
  const { name, amountPer, protein, carbs, fat, calories, status } = req.body;

  const existing = await Ingredient.findOne({ name: name?.trim() });
  if (existing) {
    throw new ApiError("Ingredient with this name already exists.", 409);
  }

  const ingredient = await Ingredient.create({
    name,
    amountPer,
    protein,
    carbs,
    fat,
    calories,
    status,
  });

  if (!ingredient) {
    throw new ApiError("Failed to add ingredient. Please try again.", 400);
  }

  return res.status(201).json({
    success: true,
    message: "Ingredient added successfully",
    data: ingredient,
  });
};

export const getIngredientById = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError("Invalid ingredient id.", 400);
  }

  const ingredient = await Ingredient.findById(id);
  if (!ingredient) {
    throw new ApiError("Ingredient not found.", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Ingredient fetched successfully",
    data: ingredient,
  });
};

export const deleteIngredient = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError("Invalid ingredient id.", 400);
  }

  const ingredient = await Ingredient.findByIdAndDelete(id);

  if (!ingredient) {
    throw new ApiError("Ingredient not found.", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Ingredient deleted successfully",
  });
};

export const getIngredient = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const q = req.query.q || null;
  const status = req.query.status || null;

  const pipeline = getIngredientPipeline(q, status);
  const { data: ingredient, pagination } = await paginateWithAggregation(
    Ingredient,
    pipeline,
    page,
    limit
  );
  if (!ingredient || ingredient.length === 0) {
    throw new ApiError("Ingredient not found", 404);
  }
  return res.status(200).json({
    success: true,
    message: "All ingredient fetched successfully.",
    pagination,
    data: ingredient,
  });
};

export const updateIngredient = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError("Invalid ingredient id.", 400);
  }

  const ingredient = await Ingredient.findByIdAndUpdate(
    id,
    { ...req.body },
    { new: true, runValidators: true }
  );

  if (!ingredient) {
    throw new ApiError("Ingredient not found.", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Ingredient updated successfully",
    data: ingredient,
  });
};
