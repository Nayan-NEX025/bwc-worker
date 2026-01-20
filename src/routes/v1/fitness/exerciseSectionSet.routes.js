import express from "express";
import {
  createSectionExerciseSet,
  getAllSectionExerciseSets,
  getSectionExerciseSetById,
  updateSectionExerciseSet,
  deleteSectionExerciseSet,
} from "../../../controllers/v1/fitness/exerciseSectionSet.controller.js";

const router = express.Router();

router.post("/", createSectionExerciseSet);
router.get("/", getAllSectionExerciseSets);
router.get("/:id", getSectionExerciseSetById);
router.put("/:id", updateSectionExerciseSet);
router.delete("/:id", deleteSectionExerciseSet);

export default router;
