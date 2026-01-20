import mongoose from "mongoose";
import SectionExercise from "../../../models/fitness/exercisesection.model.js";

const createSectionExercise = async (req, res) => {
  try {
    const { workoutId, exerciseInfoId, SectionName } = req.body;

    if (!workoutId || !exerciseInfoId || !SectionName) {
      return res.status(400).json({ message: "workoutId, exerciseInfoId, and SectionName are required" });
    }

    const sectionExercise = await SectionExercise.create({ workoutId, exerciseInfoId, SectionName });

    return res.status(201).json({ message: "Section exercise created successfully", data: sectionExercise });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create section exercise", error: error.message });
  }
};

const getAllSectionExercises = async (req, res) => {
  try {
    const sectionExercises = await SectionExercise.find().populate("workoutId exerciseInfoId").sort({ createdAt: -1 });
    return res.status(200).json({ message: "Section exercises retrieved successfully", data: sectionExercises });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve section exercises", error: error.message });
  }
};

const getSectionExerciseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID"});
    }

    const sectionExercise = await SectionExercise.findById(id).populate("workoutId exerciseInfoId");

    if (!sectionExercise) {
      return res.status(404).json({ message: "Section exercise not found" });
    }

    return res.status(200).json({ message: "Section exercise retrieved successfully", data: sectionExercise });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve section exercise", error: error.message });
  }
};

const updateSectionExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const { workoutId, exerciseInfoId, SectionName } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const updateData = {};
    if (workoutId) updateData.workoutId = workoutId;
    if (exerciseInfoId) updateData.exerciseInfoId = exerciseInfoId;
    if (SectionName) updateData.SectionName = SectionName;

    const sectionExercise = await SectionExercise.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!sectionExercise) {
      return res.status(404).json({ message: "Section exercise not found" });
    }

    return res.status(200).json({ message: "Section exercise updated successfully", data: sectionExercise });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update section exercise", error: error.message });
  }
};

const deleteSectionExercise = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const sectionExercise = await SectionExercise.findByIdAndDelete(id);

    if (!sectionExercise) {
      return res.status(404).json({ message: "Section exercise not found" });
    }

    return res.status(200).json({ message: "Section exercise deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete section exercise", error: error.message });
  }
};

export { createSectionExercise, getAllSectionExercises, getSectionExerciseById, updateSectionExercise, deleteSectionExercise };
