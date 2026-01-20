import express from "express";
import {
  createExperienceLevel,
  getAllExperienceLevels,
  getExperienceLevelById,
  updateExperienceLevel,
  deleteExperienceLevel,
} from "../../../controllers/v1/fitness/experienceLevel.controller.js";

const router = express.Router();

router.post("/", createExperienceLevel);
router.get("/", getAllExperienceLevels);
router.get("/:id", getExperienceLevelById);
router.put("/:id", updateExperienceLevel);
router.delete("/:id", deleteExperienceLevel);

export default router;
