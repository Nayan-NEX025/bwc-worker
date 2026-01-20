import { Router } from "express";
import adminRoutes from "./admin.routes.js";
import planAdminRoutes from "../../../modules/plans/routes/v1/admin.routes.js";
import { verifyToken } from "../../../middleware/auth/token.middleware.js";
import { authorizeRoles } from "../../../middleware/auth/role.middleware.js";
import { ROLES } from "../../../constants/enums/index.js";

const router = Router();

router.use(verifyToken, authorizeRoles([ROLES.ADMIN]));

router.use("/", adminRoutes);
router.use("/plans", planAdminRoutes);

export default router;
