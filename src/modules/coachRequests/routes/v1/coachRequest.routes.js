import { Router } from "express";
import {
  approveCoachRequest,
  createCoachRequest,
  getCoachRequests,
  rejectCoachRequest,
} from "../../controllers/v1/coachRequest.controller.js";
import { verifyToken } from "../../../../middleware/auth/token.middleware.js";
import { authorizeRoles } from "../../../../middleware/auth/role.middleware.js";
import { ROLES } from "../../../../constants/enums/index.js";

const router = Router();

router.use(verifyToken);

router
  .route("/")
  .post(authorizeRoles([ROLES.USER]), createCoachRequest)
  .get(authorizeRoles([ROLES.COACH]), getCoachRequests);

router
  .route("/:requestId/approve")
  .patch(authorizeRoles([ROLES.COACH]), approveCoachRequest);

router
  .route("/:requestId/reject")
  .patch(authorizeRoles([ROLES.COACH]), rejectCoachRequest);

export default router;
