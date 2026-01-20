import express from "express";
import {
  createExerciseType,
  getAllExerciseTypes,
  getExerciseTypeById,
  updateExerciseType,
  deleteExerciseType,
} from "../../../controllers/v1/fitness/exerciseType.controller.js";

const router = express.Router();

router.post("/", createExerciseType);
router.get("/", getAllExerciseTypes);
router.get("/:id", getExerciseTypeById);
router.put("/:id", updateExerciseType);
router.delete("/:id", deleteExerciseType);
export default router;
