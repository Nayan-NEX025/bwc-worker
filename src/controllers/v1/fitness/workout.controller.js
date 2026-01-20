import mongoose from "mongoose";
import Workout from "../../../models/fitness/workout.model.js";
import cloudinary from "../../../configs/cloudinary.config.js";
import { safeParse } from "../../../utils/safeParse.js";
import { success } from "zod";

const createWorkout = async (req, res) => {
  try {
    const { name, description, isPrivate, createdBy } = req.body;
    let sections = req.body.sections;

    if (!name || !description) {
      return res
        .status(400)
        .json({ message: "name and description are required" });
    }

    // Parse sections if it's a string (from form-data)
    if (typeof sections === "string") {
      try {
        sections = JSON.parse(sections);
      } catch (error) {
        return res.status(400).json({ message: "Invalid sections format" });
      }
    }

    // Check if workout name already exists (case-insensitive)
    const existingWorkout = await Workout.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingWorkout) {
      return res.status(409).json({ message: "Workout name already exists" });
    }

    let workoutImage = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "workouts",
      });
      workoutImage = result;
    }

    const workout = await Workout.create({
      name,
      description,
      isPrivate,
      workoutImage,
      sections: sections || [],
      createdBy,
    });

    const populatedWorkout = await Workout.findById(workout._id).populate(
      "sections.exercises.exerciseId"
    );

    return res.status(201).json({
      success: true,
      message: "Workout created successfully",
      data: populatedWorkout,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create workout", error: error.message });
  }
};

const getAllWorkouts = async (req, res) => {
  try {
    const { isPrivate } = req.query;
    const query = {};

    // Public workouts
    if (isPrivate === "false") {
      query.isPrivate = false;
    }
    if (isPrivate === "true") {
      query.isPrivate = true;
    }
    const workouts = await Workout.find(
      query,
      "name description isPrivate workoutImage sections createdBy"
    )
      .populate("sections.exercises.exerciseId", "-__v")
      .lean();

    if (!workouts || workouts.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No workouts found" });
    }

    return res.status(200).json({
      success: true,
      message: "Workouts fetched successfully",
      data: workouts,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve workouts", error: error.message });
  }
};

const getWorkoutById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid workout ID" });
    }

    const workout = await Workout.findById(id).populate(
      "sections.exercises.exerciseId"
    );

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Workout retrieved successfully",
      data: workout,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve workout", error: error.message });
  }
};

const updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid workout ID" });
    }

    let { name, description, isPrivate, sections, createdBy } = req.body;

    const updateData = {};

    // Check if workout name already exists (excluding current workout)
    if (name && name.trim()) {
      const existingWorkout = await Workout.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        _id: { $ne: id },
      });
      if (existingWorkout) {
        return res.status(409).json({ message: "Workout name already exists" });
      }
      updateData.name = name.trim();
    }

    if (description) updateData.description = description;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;
    if (sections) {
      const parsedSections = safeParse(sections);
      updateData.sections = parsedSections;
    }
    if (createdBy) updateData.createdBy = createdBy;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "workouts",
      });
      updateData.workoutImage = result;
    }

    const workout = await Workout.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("sections.exercises.exerciseId");

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Workout updated successfully",
      data: workout,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update workout", error: error.message });
  }
};

const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid workout ID" });
    }

    const workout = await Workout.findByIdAndDelete(id);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Workout deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete workout", error: error.message });
  }
};

export {
  createWorkout,
  getAllWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
};
