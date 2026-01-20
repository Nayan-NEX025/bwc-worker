import { Router } from "express";
import {
  createIngredient,
  deleteIngredient,
  getIngredient,
  getIngredientById,
  updateIngredient,
} from "../../../controllers/v1/nutrition/index.js";
import { authorizeRoles } from "../../../middleware/auth/role.middleware.js";
import { ROLES } from "../../../constants/enums/roles.enum.js";
import { verifyToken } from "../../../middleware/auth/token.middleware.js";

const router = Router();

// authentication and authorization middleware need to be added
router
  .route("/")
  .post(
    verifyToken,
    authorizeRoles([ROLES.ADMIN, ROLES.COACH]),
    createIngredient
  )
  .get(getIngredient); // searching, q and filtering on status

router
  .route("/:id")
  .get(getIngredientById)
  .delete(
    verifyToken,
    authorizeRoles([ROLES.ADMIN, ROLES.COACH]),
    deleteIngredient
  )
  .patch(
    verifyToken,
    authorizeRoles([ROLES.ADMIN, ROLES.COACH]),
    updateIngredient
  );

export default router;
