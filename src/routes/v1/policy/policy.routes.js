import express from "express";
import {
  activatePolicy,
  createPolicy,
  deletePolicy,
  getPolicyById,
  getPolicyHistory,
  updatePolicy,
} from "../../../controllers/v1/policy/policy.controller.js";
import { verifyToken } from "../../../middleware/auth/token.middleware.js";
import { authorizeRoles } from "../../../middleware/auth/role.middleware.js";
import { ROLES } from "../../../constants/enums/index.js";

const router = express.Router();

router.use(verifyToken, authorizeRoles([ROLES.ADMIN]));

router.route("/").post(createPolicy).get(getPolicyHistory);

router
  .route("/:id")
  .get(getPolicyById)
  .patch(updatePolicy)
  .delete(deletePolicy); // soft delete

router.route("/:id/activate").patch(activatePolicy);

export default router;
