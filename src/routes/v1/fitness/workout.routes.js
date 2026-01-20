import express from "express";
import {
  createWorkout,
  getAllWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
} from "../../../controllers/v1/fitness/workout.controller.js";
import upload from "../../../middleware/multer.js";

const router = express.Router();

router.post("/", upload.single("workoutImage"), createWorkout);
router.get("/", getAllWorkouts);
router.get("/:id", getWorkoutById);
router.patch("/:id", upload.single("workoutImage"), updateWorkout);
router.delete("/:id", deleteWorkout);

export default router;
