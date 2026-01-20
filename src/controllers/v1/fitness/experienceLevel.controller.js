import mongoose from "mongoose";
import ExperienceLevel from "../../../models/fitness/experienceLevel.model.js";

// Create Experience Level
const createExperienceLevel = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    // Check if experience level name already exists (case-insensitive)
    const existingExperienceLevel = await ExperienceLevel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingExperienceLevel) {
      return res.status(409).json({ message: "Experience level name already exists" });
    }

    const experienceLevel = await ExperienceLevel.create({ name });

    return res.status(201).json({
      message: "Experience level created successfully",
      data: {
        id: experienceLevel._id,
        name: experienceLevel.name,
        createdAt: experienceLevel.createdAt,
        updatedAt: experienceLevel.updatedAt
      }
    });

  } catch (error) {
    return res.status(500).json({ 
      message: "Failed to create experience level", 
      error: error.message 
    });
  }
};

// Get All Experience Levels
const getAllExperienceLevels = async (req, res) => {
  try {
    const experienceLevels = await ExperienceLevel.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Experience levels retrieved successfully",
      data: experienceLevels.map(experienceLevel => ({
        id: experienceLevel._id,
        name: experienceLevel.name,
        createdAt: experienceLevel.createdAt,
        updatedAt: experienceLevel.updatedAt
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve experience levels", error: error.message });
  }
};

// Get Experience Level by ID
const getExperienceLevelById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid experience level ID format" });
    }

    const experienceLevel = await ExperienceLevel.findById(id);

    if (!experienceLevel) {
      return res.status(404).json({ message: "Experience level not found" });
    }

    return res.status(200).json({
      message: "Experience level retrieved successfully",
      data: {
        id: experienceLevel._id,
        name: experienceLevel.name,
        createdAt: experienceLevel.createdAt,
        updatedAt: experienceLevel.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve experience level", error: error.message });
  }
};

// Update Experience Level
const updateExperienceLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const experienceLevelName = req.body?.name;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid experience level ID format" });
    }

    const updateData = {};

    // Check if experience level name already exists (excluding current experience level)
    if (experienceLevelName && experienceLevelName.trim()) {
      const existingExperienceLevel = await ExperienceLevel.findOne({ 
        name: { $regex: new RegExp(`^${experienceLevelName.trim()}$`, 'i') },
        _id: { $ne: id }
      });
      if (existingExperienceLevel) {
        return res.status(409).json({ message: "Experience level name already exists" });
      }
      updateData.name = experienceLevelName.trim();
    }

    const experienceLevel = await ExperienceLevel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!experienceLevel) {
      return res.status(404).json({ message: "Experience level not found" });
    }

    return res.status(200).json({
      message: "Experience level updated successfully",
      data: {
        id: experienceLevel._id,
        name: experienceLevel.name,
        createdAt: experienceLevel.createdAt,
        updatedAt: experienceLevel.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update experience level", error: error.message });
  }
};

// Delete Experience Level
const deleteExperienceLevel = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid experience level ID format" });
    }

    const experienceLevel = await ExperienceLevel.findByIdAndDelete(id);

    if (!experienceLevel) {
      return res.status(404).json({ message: "Experience level not found" });
    }

    return res.status(200).json({
      message: "Experience level deleted successfully",
      data: {
        id: experienceLevel._id,
        name: experienceLevel.name
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete experience level", error: error.message });
  }
};

export { createExperienceLevel, getAllExperienceLevels, getExperienceLevelById, updateExperienceLevel, deleteExperienceLevel };