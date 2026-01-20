import mongoose from "mongoose";
import ExerciseType from "../../../models/fitness/exerciseType.model.js";

// Create Exercise
export const createExerciseType = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    // Check if exercise name already exists (case-insensitive)
    const existingExercise = await ExerciseType.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingExercise) {
      return res.status(409).json({ message: "Exercise name already exists" });
    }

    const exercise = await ExerciseType.create({ name });

    return res.status(201).json({
      message: "Exercise created successfully",
      data: {
        id: exercise._id,
        name: exercise.name,
        createdAt: exercise.createdAt,
        updatedAt: exercise.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create exercise",
      error: error.message,
    });
  }
};

// Get All Exercises
export const getAllExerciseTypes = async (req, res) => {
  try {
    const exercises = await ExerciseType.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Exercises retrieved successfully",
      data: exercises.map((exercise) => ({
        id: exercise._id,
        name: exercise.name,
        createdAt: exercise.createdAt,
        updatedAt: exercise.updatedAt,
      })),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve exercises", error: error.message });
  }
};

// Get Exercise by ID
export const getExerciseTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid exercise ID format" });
    }

    const exercise = await ExerciseType.findById(id);

    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    return res.status(200).json({
      message: "Exercise retrieved successfully",
      data: {
        id: exercise._id,
        name: exercise.name,
        createdAt: exercise.createdAt,
        updatedAt: exercise.updatedAt,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve exercise", error: error.message });
  }
};

// Update Exercise
export const updateExerciseType = async (req, res) => {
  try {
    const { id } = req.params;
    const exerciseName = req.body?.name;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid exercise ID format" });
    }

    const updateData = {};

    // Check if exercise name already exists (excluding current exercise)
    if (exerciseName && exerciseName.trim()) {
      const existingExercise = await ExerciseType.findOne({
        name: { $regex: new RegExp(`^${exerciseName.trim()}$`, "i") },
        _id: { $ne: id },
      });
      if (existingExercise) {
        return res
          .status(409)
          .json({ message: "Exercise name already exists" });
      }
      updateData.name = exerciseName.trim();
    }

    const exercise = await ExerciseType.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    return res.status(200).json({
      message: "Exercise updated successfully",
      data: {
        id: exercise._id,
        name: exercise.name,
        createdAt: exercise.createdAt,
        updatedAt: exercise.updatedAt,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update exercise", error: error.message });
  }
};

// Delete Exercise
export const deleteExerciseType = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid exercise ID format" });
    }

    const exercise = await ExerciseType.findByIdAndDelete(id);

    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    return res.status(200).json({
      message: "Exercise deleted successfully",
      data: {
        id: exercise._id,
        name: exercise.name,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete exercise", error: error.message });
  }
};
