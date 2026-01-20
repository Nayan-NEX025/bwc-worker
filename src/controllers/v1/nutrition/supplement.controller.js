import Supplement from "../../../models/nutrition/supplement.model.js";
import ApiError from "../../../utils/error/ApiError.js";
import { getSupplementPipeline } from "../../../helpers/pipelines/supplement.pipeline.js";
import { paginateWithAggregation } from "../../../utils/pagination.js";
import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../../../configs/cloudinary.config.js";

export const createSupplement = async (req, res) => {
  const { name, description, status } = req.body;
  const imageFile = req.file;

  if (!imageFile) {
    throw new ApiError("Supplement image is required.", 400);
  }

  const imageResponse = await uploadFileToCloudinary(
    imageFile,
    "Supplement/Items"
  );

  const supplement = await Supplement.create({
    name,
    description,
    status,
    image: imageResponse ? imageResponse[0] : null,
  });

  if (!supplement) {
    throw new ApiError("Failed to create supplement. Please try again.", 400);
  }

  return res.status(201).json({
    success: true,
    message: "Supplement created successfully",
    data: supplement,
  });
};

export const getSupplementById = async (req, res) => {
  const { id } = req.params;

  const supplement = await Supplement.findById(id);
  if (!supplement) {
    throw new ApiError("Supplement not found.", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Supplement fetched successfully",
    data: supplement,
  });
};

export const deleteSupplement = async (req, res) => {
  const { id } = req.params;

  const supplement = await Supplement.findByIdAndDelete(id);

  if (!supplement) {
    throw new ApiError("Supplement not found.", 404);
  }

  if (supplement?.image) {
    await deleteFileFromCloudinary(supplement.image);
  }

  return res.status(200).json({
    success: true,
    message: "Supplement deleted successfully",
  });
};

export const getAllSupplement = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const q = req.query.q || null;
  const status = req.query.status || null;

  const pipeline = getSupplementPipeline(q, status);

  const { data: supplements, pagination } = await paginateWithAggregation(
    Supplement,
    pipeline,
    page,
    limit
  );

  if (!supplements || supplements.length === 0) {
    throw new ApiError("Supplement not found.", 404);
  }

  return res.status(200).json({
    success: true,
    message: "All supplements fetched successfully.",
    pagination,
    data: supplements,
  });
};

export const updateSupplementById = async (req, res) => {
  const { id } = req.params;

  const existingSupplement = await Supplement.findById(id);
  if (!existingSupplement) {
    throw new ApiError("Supplement not found.", 404);
  }

  const imageFile = req.file;
  let imageResponse = null;

  const updateData = {
    ...req.body,
  };

  if (imageFile) {
    // Upload new image
    imageResponse = await uploadFileToCloudinary(imageFile, "Supplement/Items");

    // Delete old image from Cloudinary if exists
    if (existingSupplement.image) {
      await deleteFileFromCloudinary(existingSupplement.image);
    }

    updateData.image = imageResponse ? imageResponse[0] : null;
  }

  const supplement = await Supplement.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!supplement) {
    throw new ApiError("Failed to update supplement.", 400);
  }

  return res.status(200).json({
    success: true,
    message: "Supplement updated successfully",
    data: supplement,
  });
};
