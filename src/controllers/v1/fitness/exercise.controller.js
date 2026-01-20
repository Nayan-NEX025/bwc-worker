import mongoose from "mongoose";
import Exercise from "../../../models/fitness/exercise.model.js";
import { Muscle } from "../../../models/fitness/muscle.model.js";
import ExerciseType from "../../../models/fitness/exerciseType.model.js";
import { Equipment } from "../../../models/fitness/equipment.model.js";
import Machine from "../../../models/fitness/machine.model.js";
import ForceType from "../../../models/fitness/forceType.model.js";
import ExperienceLevel from "../../../models/fitness/experienceLevel.model.js";
import cloudinary, {
  uploadFileToCloudinary,
} from "../../../configs/cloudinary.config.js";
import ApiError from "../../../utils/error/ApiError.js";
import { paginateWithAggregation } from "../../../utils/pagination.js";
import { getExercisePipeline } from "../../../helpers/pipelines/exercise.pipeline.js";
import { buildBaseMatch } from "../../../helpers/exerciseMatch.builder.js";
import { buildRoleMatch } from "../../../helpers/roleFilter.builder.js";

export const createExercise = async (req, res) => {
  let {
    exerciseName,
    targetMuscle,
    targetExerciseType,
    targetEquipments,
    targetMachine,
    targetForce,
    targetExperienceLevel,
    overview,
    tips,
    instruction,
  } = req.body;

  // 🚫 Users cannot create exercises
  if (!["admin", "coach"].includes(req.user.role)) {
    throw new ApiError("You are not allowed to create exercises", 403);
  }
  const videoFile = req.file;

  // Parse instruction properly
  if (typeof instruction === "string") {
    try {
      instruction = JSON.parse(instruction);
    } catch (e) {
      instruction = [];
    }
  } else if (!Array.isArray(instruction)) {
    instruction = [];
  }

  if (!req.file) {
    throw new ApiError("Video file is required", 400);
  }

  const muscle = await Muscle.findById(targetMuscle);
  if (!muscle) {
    throw new ApiError("Muscle not found", 404);
  }

  const exercise = await ExerciseType.findById(targetExerciseType);
  if (!exercise) throw new ApiError("Exercise type not found", 404);

  const equipment = await Equipment.findById(targetEquipments);
  if (!equipment) throw new ApiError("Equipment not found", 404);

  const machine = await Machine.findById(targetMachine);
  if (!machine) throw new ApiError("Machine not found", 404);
  const force = await ForceType.findById(targetForce);
  if (!force) throw new ApiError("Force type not found", 404);

  const experienceLevel = await ExperienceLevel.findById(targetExperienceLevel);
  if (!experienceLevel) throw new ApiError("Experience level not found", 404);

  console.time("cloudinaryUpload");
  // Upload video to Cloudinary
  const videoResult = await uploadFileToCloudinary(
    videoFile,
    "exercise-videos",
  );
  console.timeEnd("cloudinaryUpload");
  console.log(videoResult);
  const exerciseInfo = await Exercise.create({
    exerciseName,
    targetMuscle: muscle._id,
    targetExerciseType: exercise._id,
    targetEquipments: equipment._id,
    targetMachine: machine._id,
    targetForce: force._id,
    targetExperienceLevel: experienceLevel._id,
    videoUrl: videoResult[0],
    overview,
    tips,
    instruction: instruction || [],
    createdBy: req.user.id,
    creatorModel: req.user.role === "admin" ? "Auth" : "Coach",
  });

  return res.status(201).json({
    success: true,
    message: "Exercise created successfully",
    data: exerciseInfo,
  });
};

export const getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Invalid exercise info ID format" });
    }

    const exerciseInfo = await Exercise.findById(id)
      .populate("targetMuscle")
      .populate("targetExerciseType")
      .populate("targetEquipments")
      .populate("targetMachine")
      .populate("targetForce")
      .populate("targetExperienceLevel");

    if (!exerciseInfo) {
      return res.status(404).json({ message: "Exercise info not found" });
    }

    return res.status(200).json({
      message: "Exercise info retrieved successfully",
      data: exerciseInfo,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve exercise info",
      error: error.message,
    });
  }
};

export const updateExerciseById = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      exerciseName,
      targetMuscle,
      targetExerciseType,
      targetEquipments,
      targetMachine,
      targetForce,
      targetExperienceLevel,
      overview,
      tips,
      instruction,
    } = req.body;

    // Parse instruction properly
    if (typeof instruction === "string") {
      try {
        instruction = JSON.parse(instruction);
      } catch (e) {
        instruction = [];
      }
    } else if (instruction && !Array.isArray(instruction)) {
      instruction = [];
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Invalid exercise info ID format" });
    }

    const updateData = {};

    // Check if exercise name already exists (excluding current exercise)
    if (exerciseName && exerciseName.trim()) {
      const existingExercise = await Exercise.findOne({
        exerciseName: { $regex: new RegExp(`^${exerciseName.trim()}$`, "i") },
        _id: { $ne: id },
      });
      if (existingExercise) {
        return res
          .status(409)
          .json({ message: "Exercise name already exists" });
      }
      updateData.exerciseName = exerciseName.trim();
    }

    if (overview) updateData.overview = overview;
    if (tips) updateData.tips = tips;
    if (instruction) updateData.instruction = instruction;

    if (req.file) {
      const videoResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "exercise-videos",
        resource_type: "video",
      });
      updateData.videoUrl = videoResult.secure_url;
    }

    if (targetMuscle) {
      const muscle = await Muscle.findById(targetMuscle);
      if (!muscle) return res.status(404).json({ message: "Muscle not found" });
      updateData.targetMuscle = muscle._id;
    }

    if (targetExerciseType) {
      const exercise = await ExerciseType.findById(targetExerciseType);
      if (!exercise)
        return res.status(404).json({ message: "Exercise type not found" });
      updateData.targetExerciseType = exercise._id;
    }

    if (targetEquipments) {
      const equipment = await Equipment.findById(targetEquipments);
      if (!equipment)
        return res.status(404).json({ message: "Equipment not found" });
      updateData.targetEquipments = equipment._id;
    }

    if (targetMachine) {
      const machine = await Machine.findById(targetMachine);
      if (!machine)
        return res.status(404).json({ message: "Machine not found" });
      updateData.targetMachine = machine._id;
    }

    if (targetForce) {
      const force = await ForceType.findById(targetForce);
      if (!force)
        return res.status(404).json({ message: "Force type not found" });
      updateData.targetForce = force._id;
    }

    if (targetExperienceLevel) {
      const experienceLevel = await ExperienceLevel.findById(
        targetExperienceLevel,
      );
      if (!experienceLevel)
        return res.status(404).json({ message: "Experience level not found" });
      updateData.targetExperienceLevel = experienceLevel._id;
    }

    const exerciseInfo = await Exercise.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!exerciseInfo) {
      return res.status(404).json({ message: "Exercise info not found" });
    }

    return res.status(200).json({
      message: "Exercise info updated successfully",
      data: exerciseInfo,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Exercise name already exists" });
    }
    return res.status(500).json({
      message: "Failed to update exercise info",
      error: error.message,
    });
  }
};

export const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Invalid exercise info ID format" });
    }

    const exerciseInfo = await Exercise.findByIdAndDelete(id);

    if (!exerciseInfo) {
      return res.status(404).json({ message: "Exercise info not found" });
    }

    return res.status(200).json({
      message: "Exercise info deleted successfully",
      data: { id: exerciseInfo._id },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete exercise info",
      error: error.message,
    });
  }
};

export const getAllExercise = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;

  const { q = null, status = null } = req.query;

  // 🧱 Step 1: Base filters
  const baseMatch = buildBaseMatch({ q, status });

  // 🔐 Step 2: Role-based filters
  const roleMatch = await buildRoleMatch(req);

  // 🧩 Step 3: Merge safely
  const matchStage =
    Object.keys(roleMatch).length === 0
      ? baseMatch
      : { $and: [baseMatch, roleMatch] };

  const pipeline = getExercisePipeline({ matchStage });

  const { data, pagination } = await paginateWithAggregation(
    Exercise,
    pipeline,
    page,
    limit,
  );

  if (!data?.length) {
    throw new ApiError("Exercises not found", 404);
  }

  const isPublic = !req.user;
  const role = req.user?.role;

  // RESPONSE SANITIZATION (HERE)
  const sanitizedData = data.map((exercise) => {
    // for public + normal users
    if (isPublic || role === "user") {
      const { createdBy, creatorModel, ...safeExercise } = exercise;
      return safeExercise;
    }

    // for coach + admin
    return exercise;
  });

  res.status(200).json({
    success: true,
    message: "Exercises retrieved successfully",
    pagination,
    data: sanitizedData,
  });
};
