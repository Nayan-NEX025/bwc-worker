import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../../../configs/cloudinary.config.js";
import DietPlan from "../../../models/nutrition/dietPlan.model.js";
import ApiError from "../../../utils/error/ApiError.js";
import { safeParse } from "../../../utils/safeParse.js";

export const createDietPlan = async (req, res) => {
  const { name, mainGoal, description, notes, supplement } = req.body;
  const imageFile = req.file;

  if (!imageFile) {
    throw new ApiError("Diet plan image is required.", 400);
  }

  // Upload image to Cloudinary
  const imageResponse = await uploadFileToCloudinary(
    imageFile,
    "DietPlan/Items"
  );

  const dietPlan = await DietPlan.create({
    name,
    mainGoal,
    description,
    notes,
    supplement,
    sections: safeParse(req.body?.sections),
    image: imageResponse ? imageResponse[0] : null,
  });

  if (!dietPlan) {
    throw new ApiError("Failed to create diet plan. Please try again.", 400);
  }

  return res.status(201).json({
    success: true,
    message: "Diet plan created successfully",
    data: dietPlan,
  });
};

export const getDietPlanById = async (req, res) => {
  const { id } = req.params;

  const dietPlan = await DietPlan.findById(id)
    .populate("supplement", "-__v")
    .populate("sections.items.ingredient")
    .lean();

  if (!dietPlan) {
    throw new ApiError("Diet plan not found.", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Diet plan fetched successfully",
    data: dietPlan,
  });
};

export const deleteDietPlanById = async (req, res) => {
  const deletedDietPlan = await DietPlan.findByIdAndDelete(req.params?.id);

  if (!deletedDietPlan) {
    throw new ApiError("Diet plan not found.", 404);
  }
  if (deletedDietPlan.image) {
    await deleteFileFromCloudinary(deletedDietPlan.image);
  }
  return res.status(200).json({
    success: true,
    message: "Diet plan deleted successfully",
  });
};

export const updateDietPlanById = async (req, res) => {
  const { id } = req.params;
  const imageFile = req.file;

  const dietPlan = await DietPlan.findById(id);

  if (!dietPlan) {
    throw new ApiError("Diet plan not found.", 404);
  }

  if (imageFile) {
    // Upload new image to Cloudinary and delete the old one
    const imageResponse = await uploadFileToCloudinary(
      imageFile,
      "DietPlan/Items"
    );
    if (dietPlan.image) {
      await deleteFileFromCloudinary(dietPlan.image);
    }
    dietPlan.image = imageResponse ? imageResponse[0] : undefined;
  }

  const updatedDietPlan = await DietPlan.findByIdAndUpdate(
    id,
    {
      ...req.body,
      sections: safeParse(req.body?.sections),
      image: dietPlan.image,
    },
    { new: true, runValidators: true }
  ).select("-__v -createdAt -updatedAt");

  if (!updatedDietPlan) {
    throw new ApiError("Failed to update diet plan. Please try again.", 400);
  }

  return res.status(200).json({
    success: true,
    message: "Diet plan updated successfully",
    data: updatedDietPlan,
  });
};

export const getAllDietPlans = async (req, res) => {
  const dietPlans = await DietPlan.find()
    .populate("supplement", "-__v")
    .populate("sections.items.ingredient", "-__v")
    .lean();

  if (!dietPlans || dietPlans.length === 0) {
    throw new ApiError("No diet plans found.", 404);
  }
  return res.status(200).json({
    success: true,
    message: "Diet plans fetched successfully",
    data: dietPlans,
  });
};
