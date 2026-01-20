import { Router } from "express";
import {
  createSupplement,
  deleteSupplement,
  getAllSupplement,
  getSupplementById,
  updateSupplementById,
} from "../../../controllers/v1/nutrition/index.js";
import upload from "../../../middleware/multer.js";
import { authorizeRoles } from "../../../middleware/auth/role.middleware.js";
import { ROLES } from "../../../constants/enums/roles.enum.js";
import { verifyToken } from "../../../middleware/auth/token.middleware.js";

const router = Router();

router
  .route("/")
  .post(
    verifyToken,
    authorizeRoles([ROLES.ADMIN, ROLES.COACH]),
    upload.single("image"),
    createSupplement
  )
  .get(getAllSupplement);

router
  .route("/:id")
  .get(getSupplementById)
  .patch(
    verifyToken,
    authorizeRoles([ROLES.ADMIN, ROLES.COACH]),
    upload.single("image"),
    updateSupplementById
  )
  .delete(
    verifyToken,
    authorizeRoles([ROLES.ADMIN, ROLES.COACH]),
    deleteSupplement
  );

export default router;
