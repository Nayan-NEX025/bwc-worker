import express from "express";
import {
  createSectionExercise,
  getAllSectionExercises,
  getSectionExerciseById,
  updateSectionExercise,
  deleteSectionExercise,
} from "../../../controllers/v1/fitness/exerciseSection.controller.js";

const router = express.Router();

router.post("/", createSectionExercise);
router.get("/", getAllSectionExercises);
router.get("/:id", getSectionExerciseById);
router.put("/:id", updateSectionExercise);
router.delete("/:id", deleteSectionExercise);

export default router;
