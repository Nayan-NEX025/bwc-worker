import { Router } from "express";
import {
  createDietPlan,
  deleteDietPlanById,
  getAllDietPlans,
  getDietPlanById,
  updateDietPlanById,
} from "../../../controllers/v1/nutrition/index.js";
import upload from "../../../middleware/multer.js";
import { ROLES } from "../../../constants/enums/roles.enum.js";
import { authorizeRoles } from "../../../middleware/auth/role.middleware.js";
import { verifyToken } from "../../../middleware/auth/token.middleware.js";

const router = Router();

router
  .route("/")
  .post(
    verifyToken,
    authorizeRoles([ROLES.ADMIN, ROLES.COACH]),
    upload.single("image"),
    createDietPlan
  )
  .get(getAllDietPlans);

router
  .route("/:id")
  .get(getDietPlanById)
  .patch(
    verifyToken,
    authorizeRoles([ROLES.ADMIN, ROLES.COACH]),
    upload.single("image"),
    updateDietPlanById
  )
  .delete(
    verifyToken,
    authorizeRoles([ROLES.ADMIN, ROLES.COACH]),
    deleteDietPlanById
  );

export default router;
