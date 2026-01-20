import { Router } from "express";

import {
  createRecipe,
  deleteRecipeById,
  getAllRecipes,
  getRecipeById,
  updateRecipeById,
} from "../../../controllers/v1/nutrition/index.js";
import upload from "../../../middleware/multer.js";
import { authorizeRoles } from "../../../middleware/auth/role.middleware.js";
import { ROLES } from "../../../constants/enums/roles.enum.js";
import {
  optionalVerifyToken,
  verifyToken,
} from "../../../middleware/auth/token.middleware.js";

const router = Router();

router
  .route("/")
  .post(
    verifyToken,
    authorizeRoles([ROLES.ADMIN, ROLES.COACH]),
    upload.single("image"),
    createRecipe,
  )
  .get(optionalVerifyToken, getAllRecipes);

router
  .route("/:id")
  .get(getRecipeById)
  .delete(
    verifyToken,
    authorizeRoles([ROLES.ADMIN, ROLES.COACH]),
    deleteRecipeById,
  )
  .patch(
    verifyToken,
    authorizeRoles([ROLES.ADMIN, ROLES.COACH]),
    upload.single("image"),
    updateRecipeById,
  );

export default router;
