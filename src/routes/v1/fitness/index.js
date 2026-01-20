import { Router } from "express";
import equipmentRoutes from "./equipment.routes.js";
import exerciseTypesRoutes from "./exerciseType.routes.js";
import exerciseRoutes from "./exercise.routes.js";
import exerciseSectionRoutes from "./exerciseSection.routes.js";
import experienceLevelRoutes from "./experienceLevel.routes.js";
import forceTypeRoutes from "./forceType.routes.js";
import machineRoutes from "./machine.routes.js";
import muscleRoutes from "./muscle.routes.js";
import workoutRoutes from "./workout.routes.js";

const router = Router();

router.use("/equipments", equipmentRoutes);
router.use("/exercises-types", exerciseTypesRoutes);
router.use("/exercises", exerciseRoutes);
router.use("/exercise-section", exerciseSectionRoutes);
router.use("/experience-level", experienceLevelRoutes);
router.use("/force-type", forceTypeRoutes);
router.use("/machines", machineRoutes);
router.use("/muscles", muscleRoutes);
router.use("/workouts", workoutRoutes);

export default router;
