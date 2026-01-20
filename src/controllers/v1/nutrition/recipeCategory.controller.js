import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../../../configs/cloudinary.config.js";
import { getRecipeCategoryPipeline } from "../../../helpers/pipelines/recipeCategory.pipeline.js";
import RecipeCategory from "../../../models/nutrition/recipeCategory.model.js";
import ApiError from "../../../utils/error/ApiError.js";
import { paginateWithAggregation } from "../../../utils/pagination.js";

export const createRecipeCategory = async (req, res) => {
  const { name, status } = req.body;
  const image = req.file;
  let imageResponse = null;

  if (image) {
    imageResponse = await uploadFileToCloudinary(
      image,
      "Recipe/Category" // Items
    );
  }

  const recipeCategory = await RecipeCategory.create({
    name,
    image: (imageResponse && imageResponse[0]) || null,
    status,
  });

  if (!recipeCategory) {
    throw new ApiError("Failed to add recipe category. Please try again.", 400);
  }

  return res.status(201).json({
    success: true,
    message: "Recipe category created successfully",
    data: recipeCategory,
  });
};

export const updateRecipeCategoryById = async (req, res) => {
  const category = await RecipeCategory.findById(req.params?.id);
  if (!category) {
    throw new ApiError("Recipe category not found.", 404);
  }

  const image = req.file;
  let imageResponse = null;
  if (image) {
    imageResponse = await uploadFileToCloudinary(image, "Recipe/Category");
    if (category?.image) {
      await deleteFileFromCloudinary(category.image);
    }
  }

  const updatedCategory = await RecipeCategory.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name || category.name,
      image: imageResponse ? imageResponse[0] : undefined,
      status: req.body.status || category.status,
    },
    { new: true, runValidators: true }
  );

  if (!updatedCategory) {
    throw new ApiError(
      "Failed to update recipe category. Please try again.",
      400
    );
  }

  return res.status(200).json({
    success: true,
    message: "Recipe category updated successfully",
    data: updatedCategory,
  });
};

export const deleteRecipeCategoryById = async (req, res) => {
  const { id } = req.params;

  const recipeCategory = await RecipeCategory.findByIdAndDelete(id);

  if (!recipeCategory) {
    throw new ApiError("Recipe category not found.", 404);
  }

  if (recipeCategory?.image) {
    await deleteFileFromCloudinary(recipeCategory.image);
  }

  return res.status(200).json({
    success: true,
    message: "Recipe category deleted.",
  });
};

export const getRecipeCategoryById = async (req, res) => {
  const { id } = req.params;
  const recipeCategory = await RecipeCategory.findById(id);

  if (!recipeCategory) {
    throw new ApiError("Recipe category not found.", 404);
  }
  return res.status(200).json({
    success: true,
    message: "Recipe category fetched successfully",
    data: recipeCategory,
  });
};

export const getRecipeCategory = async (req, res) => {
  console.log("first");
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const q = req.query.q || null;
  const status = req.query.status || null;

  const pipeline = getRecipeCategoryPipeline(q, status);
  const { data: recipeCategory, pagination } = await paginateWithAggregation(
    RecipeCategory,
    pipeline,
    page,
    limit
  );
  if (!recipeCategory || recipeCategory.length === 0) {
    throw new ApiError("Recipe Category not found", 404);
  }
  return res.status(200).json({
    success: true,
    message: "All Recipe Category fetched successfully.",
    pagination,
    data: recipeCategory,
  });
};
