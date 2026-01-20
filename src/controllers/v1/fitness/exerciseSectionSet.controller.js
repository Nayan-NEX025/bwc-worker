import mongoose from "mongoose";
import SectionExerciseSet from "../models/exercise/exercisesectionset.model.js";

const createSectionExerciseSet = async (req, res) => {
  try {
    const { sectionExerciseId, sets, tempo } = req.body;

    if (!sectionExerciseId) {
      return res.status(400).json({ message: "sectionExerciseId is required" });
    }

    const sectionExerciseSet = await SectionExerciseSet.create({ sectionExerciseId, sets, tempo });

    return res.status(201).json({ message: "Section exercise set created successfully", data: sectionExerciseSet });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create section exercise set", error: error.message });
  }
};

const getAllSectionExerciseSets = async (req, res) => {
  try {
    const sectionExerciseSets = await SectionExerciseSet.find().populate("sectionExerciseId").sort({ createdAt: -1 });
    return res.status(200).json({ message: "Section exercise sets retrieved successfully", data: sectionExerciseSets });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve section exercise sets", error: error.message });
  }
};

const getSectionExerciseSetById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const sectionExerciseSet = await SectionExerciseSet.findById(id).populate("sectionExerciseId");

    if (!sectionExerciseSet) {
      return res.status(404).json({ message: "Section exercise set not found" });
    }

    return res.status(200).json({ message: "Section exercise set retrieved successfully", data: sectionExerciseSet });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve section exercise set", error: error.message });
  }
};

const updateSectionExerciseSet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const sectionExerciseSet = await SectionExerciseSet.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!sectionExerciseSet) {
      return res.status(404).json({ message: "Section exercise set not found" });
    }

    return res.status(200).json({ message: "Section exercise set updated successfully", data: sectionExerciseSet });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update section exercise set", error: error.message });
  }
};

const deleteSectionExerciseSet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const sectionExerciseSet = await SectionExerciseSet.findByIdAndDelete(id);

    if (!sectionExerciseSet) {
      return res.status(404).json({ message: "Section exercise set not found" });
    }

    return res.status(200).json({ message: "Section exercise set deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete section exercise set", error: error.message });
  }
};

export { createSectionExerciseSet, getAllSectionExerciseSets, getSectionExerciseSetById, updateSectionExerciseSet, deleteSectionExerciseSet };
