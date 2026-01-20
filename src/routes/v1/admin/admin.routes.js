import { Router } from "express";
import { verifyToken } from "../../../middleware/auth/token.middleware.js";
import {
  authorizeRoles,
  setRoleContext,
} from "../../../middleware/auth/role.middleware.js";
import { ROLES } from "../../../constants/enums/index.js";
import { getAllUsers } from "../../../controllers/v1/admin/admin.controller.js";

const router = Router();

router.use(verifyToken, authorizeRoles([ROLES.ADMIN]));

router.route("/users").get(setRoleContext("user"), getAllUsers); // q -> search, filter needed to be implemented
router.route("/coaches").get(setRoleContext("coach"), getAllUsers);

export default router;
