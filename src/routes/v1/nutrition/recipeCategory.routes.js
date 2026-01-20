import { Router } from "express";
import {
  createRecipeCategory,
  deleteRecipeCategoryById,
  getRecipeCategory,
  getRecipeCategoryById,
  updateRecipeCategoryById,
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
    createRecipeCategory
  )
  .get(getRecipeCategory); // searching, q and filtering on status

router
  .route("/:id")
  .patch(
    verifyToken,
    authorizeRoles([ROLES.ADMIN, ROLES.COACH]),
    upload.single("image"),
    updateRecipeCategoryById
  )
  .delete(
    verifyToken,
    authorizeRoles([ROLES.ADMIN, ROLES.COACH]),
    deleteRecipeCategoryById
  )
  .get(getRecipeCategoryById);

export default router;
