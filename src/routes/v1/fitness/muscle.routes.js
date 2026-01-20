import express from "express";
import {
  createMuscle,
  getAllMuscles,
  getMuscleById,
  updateMuscle,
  deleteMuscle,
} from "../../../controllers/v1/fitness/muscle.controller.js";
import upload from "../../../middleware/multer.js";

const router = express.Router();

router.post(
  "/",
  upload.fields([
    { name: "targetMuscleImage" },
    { name: "muscleThumbnailImage" },
  ]),
  createMuscle
);
router.get("/", getAllMuscles);
router.get("/:id", getMuscleById);
router.put(
  "/:id",
  upload.fields([
    { name: "targetMuscleImage" },
    { name: "muscleThumbnailImage" },
  ]),
  updateMuscle
);
router.delete("/:id", deleteMuscle);

export default router;
