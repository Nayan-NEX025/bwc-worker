import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../../../configs/cloudinary.config.js";
import { getAllRecipesPipeline } from "../../../helpers/pipelines/getAllRecipe.pipeline.js";
import Recipe from "../../../models/nutrition/recipe.model.js";
import ApiError from "../../../utils/error/ApiError.js";
import { paginateWithAggregation } from "../../../utils/pagination.js";
import { safeParse } from "../../../utils/safeParse.js";

export const createRecipe = async (req, res) => {
  const image = req.file;
  let imageResponse = null;
  if (image) {
    imageResponse = await uploadFileToCloudinary(image, "Recipe/Items");
  }
  const recipe = await Recipe.create({
    ...req.body,
    image: imageResponse ? imageResponse[0] : null,
    ingredients: req.body.ingredients ? safeParse(req.body.ingredients) : [],
    instructions: req.body.instructions ? safeParse(req.body.instructions) : [],
    prepTime: req.body.prepTime
      ? safeParse(req.body.prepTime)
      : { hours: 0, minutes: 0 },
    cookTime: req.body.cookTime
      ? safeParse(req.body.cookTime)
      : { hours: 0, minutes: 0 },
    createdBy: req.user.id, // id is string, Mongoose virtual
    creatorModel: req.user.role === "admin" ? "Auth" : "Coach",
  });

  if (!recipe) {
    throw new ApiError("Failed to create recipe. Please try again.", 400);
  }

  return res.status(201).json({
    success: true,
    message: "Recipe created successfully",
    data: recipe,
  });
};

export const getRecipeById = async (req, res) => {
  const { id } = req.params;

  const recipe = await Recipe.findById(id).populate({
    path: "ingredients",
    populate: {
      path: "ingredient",
    },
  });

  if (!recipe) {
    throw new ApiError("Recipe not found.", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Recipe fetched successfully",
    data: recipe,
  });
};

export const deleteRecipeById = async (req, res) => {
  const { id } = req.params;

  const recipe = await Recipe.findByIdAndDelete(id);

  if (!recipe) {
    throw new ApiError("Recipe not found.", 404);
  }

  if (recipe?.image) {
    await deleteFileFromCloudinary(recipe.image);
  }

  return res.status(200).json({
    success: true,
    message: "Recipe deleted successfully",
  });
};

export const updateRecipeById = async (req, res) => {
  const { id } = req.params;
  const existingRecipe = await Recipe.findById(id);
  if (!existingRecipe) {
    throw new ApiError("Recipe not found.", 404);
  }

  const image = req.file;
  let imageResponse = null;

  const updateData = {
    ...req.body,
    ingredients: req.body.ingredients
      ? safeParse(req.body.ingredients)
      : existingRecipe.ingredients,
    instructions: req.body.instructions
      ? safeParse(req.body.instructions)
      : existingRecipe.instructions,
    prepTime: req.body.prepTime
      ? safeParse(req.body.prepTime)
      : existingRecipe.prepTime,
    cookTime: req.body.cookTime
      ? safeParse(req.body.cookTime)
      : existingRecipe.cookTime,
  };

  if (image) {
    console.log("inside image upload");
    imageResponse = await uploadFileToCloudinary(image, "Recipe/Items");
    if (existingRecipe.image) {
      await deleteFileFromCloudinary(existingRecipe.image);
    }
    updateData.image = imageResponse ? imageResponse[0] : null;
  }

  const recipe = await Recipe.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!recipe) {
    throw new ApiError("Failed to update recipe.", 400);
  }

  return res.status(200).json({
    success: true,
    message: "Recipe updated successfully",
    data: recipe,
  });
};

export const getAllRecipes = async (req, res) => {
  console.log(req.user);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { q, status } = req.query;

  const pipeline = await getAllRecipesPipeline({ req, q, status });
  const { data: recipes, pagination } = await paginateWithAggregation(
    Recipe,
    pipeline,
    page,
    limit,
  );

  if (!recipes || recipes.length === 0) {
    throw new ApiError("No recipes found.", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Recipes fetched successfully",
    meta: {
      pagination,
    },
    data: recipes,
  });
};
