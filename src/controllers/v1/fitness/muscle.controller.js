import mongoose from "mongoose";
import { Muscle } from "../../../models/fitness/muscle.model.js";
import cloudinary from "../../../configs/cloudinary.config.js";

// Create Muscle
const createMuscle = async (req, res) => {
  try {
    const muscleName = req.body?.muscleName;

    // Validate required fields
    if (!muscleName) {
      return res.status(400).json({ message: "muscleName is required" });
    }

    // Check if muscle name already exists
    const existingMuscle = await Muscle.findOne({
      muscleName: { $regex: new RegExp(`^${muscleName}$`, "i") },
    });
    if (existingMuscle) {
      return res.status(409).json({ message: "Muscle name already exists" });
    }

    if (
      !req.files ||
      !req.files.targetMuscleImage ||
      !req.files.muscleThumbnailImage
    ) {
      return res.status(400).json({
        message: "Both targetMuscleImage and muscleThumbnailImage are required",
      });
    }

    // Upload images to Cloudinary
    const targetResult = await cloudinary.uploader.upload(
      req.files.targetMuscleImage[0].path,
      {
        folder: "muscles/target",
        resource_type: "image",
      }
    );

    const thumbnailResult = await cloudinary.uploader.upload(
      req.files.muscleThumbnailImage[0].path,
      {
        folder: "muscles/thumbnail",
        resource_type: "image",
      }
    );

    const muscle = await Muscle.create({
      muscleName,
      targetMuscleImage: targetResult,
      muscleThumbnailImage: thumbnailResult,
    });

    return res.status(201).json({
      message: "Muscle created successfully",
      data: {
        id: muscle._id,
        muscleName: muscle.muscleName,
        targetMuscleImage: muscle.targetMuscleImage,
        muscleThumbnailImage: muscle.muscleThumbnailImage,
        createdAt: muscle.createdAt,
        updatedAt: muscle.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create muscle",
      error: error.message,
    });
  }
};

// Get All Muscles
const getAllMuscles = async (req, res) => {
  try {
    const muscles = await Muscle.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Muscles retrieved successfully",
      data: muscles.map((muscle) => ({
        id: muscle._id,
        muscleName: muscle.muscleName,
        targetMuscleImage: muscle.targetMuscleImage,
        muscleThumbnailImage: muscle.muscleThumbnailImage,
        createdAt: muscle.createdAt,
        updatedAt: muscle.updatedAt,
      })),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve muscles", error: error.message });
  }
};

// Get Muscle by ID
const getMuscleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid muscle ID format" });
    }

    const muscle = await Muscle.findById(id);

    if (!muscle) {
      return res.status(404).json({ message: "Muscle not found" });
    }

    return res.status(200).json({
      message: "Muscle retrieved successfully",
      data: {
        id: muscle._id,
        muscleName: muscle.muscleName,
        targetMuscleImage: muscle.targetMuscleImage,
        muscleThumbnailImage: muscle.muscleThumbnailImage,
        createdAt: muscle.createdAt,
        updatedAt: muscle.updatedAt,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve muscle", error: error.message });
  }
};

// Update Muscle
const updateMuscle = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.body);
    const muscleName = req.body?.muscleName;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid muscle ID format" });
    }

    const updateData = {};

    // Check if muscle name already exists (excluding current muscle)
    if (muscleName && muscleName.trim()) {
      console.log("kfjsk");
      const existingMuscle = await Muscle.findOne({
        muscleName: { $regex: new RegExp(`^${muscleName.trim()}$`, "i") },
        _id: { $ne: id },
      });
      if (existingMuscle) {
        return res.status(409).json({ message: "Muscle name already exists" });
      }
      updateData.muscleName = muscleName.trim();
    }

    if (req.files?.targetMuscleImage) {
      const targetResult = await cloudinary.uploader.upload(
        req.files.targetMuscleImage[0].path,
        {
          folder: "muscles/target",
          resource_type: "image",
        }
      );
      updateData.targetMuscleImage = targetResult;
    }

    if (req.files?.muscleThumbnailImage) {
      const thumbnailResult = await cloudinary.uploader.upload(
        req.files.muscleThumbnailImage[0].path,
        {
          folder: "muscles/thumbnail",
          resource_type: "image",
        }
      );
      updateData.muscleThumbnailImage = thumbnailResult;
    }
    console.log(updateData);

    const muscle = await Muscle.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    console.log(muscle);
    if (!muscle) {
      return res.status(404).json({ message: "Muscle not found" });
    }

    return res.status(200).json({
      message: "Muscle updated successfully",
      data: {
        id: muscle._id,
        muscleName: muscle.muscleName,
        targetMuscleImage: muscle.targetMuscleImage,
        muscleThumbnailImage: muscle.muscleThumbnailImage,
        createdAt: muscle.createdAt,
        updatedAt: muscle.updatedAt,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update muscle", error: error.message });
  }
};

// Delete Muscle
const deleteMuscle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid muscle ID format" });
    }

    const muscle = await Muscle.findByIdAndDelete(id);

    if (!muscle) {
      return res.status(404).json({ message: "Muscle not found" });
    }

    return res.status(200).json({
      message: "Muscle deleted successfully",
      data: {
        id: muscle._id,
        muscleName: muscle.muscleName,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete muscle", error: error.message });
  }
};

export {
  createMuscle,
  getAllMuscles,
  getMuscleById,
  updateMuscle,
  deleteMuscle,
};
