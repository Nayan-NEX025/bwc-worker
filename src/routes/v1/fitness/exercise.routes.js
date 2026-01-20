import express from "express";
import upload from "../../../middleware/multer.js";
import {
  createExercise,
  deleteExercise,
  getAllExercise,
  getExerciseById,
  updateExerciseById,
} from "../../../controllers/v1/fitness/exercise.controller.js";
import {
  optionalVerifyToken,
  verifyToken,
} from "../../../middleware/auth/token.middleware.js";
import { authorizeRoles } from "../../../middleware/auth/role.middleware.js";
import { ROLES } from "../../../constants/enums/index.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles([ROLES.ADMIN, ROLES.COACH]),
  upload.single("videoUrl"),
  createExercise
);
router.get("/", optionalVerifyToken, getAllExercise); // optional authorization
router.get("/:id", optionalVerifyToken, getExerciseById);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles([ROLES.ADMIN, ROLES.COACH]),
  upload.single("videoUrl"),
  updateExerciseById
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles([ROLES.ADMIN, ROLES.COACH]),
  deleteExercise
);

export default router;
