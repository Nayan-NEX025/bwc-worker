import { Router } from "express";
import recipeRoutes from "./recipe.routes.js";
import recipeCategoryRoutes from "./recipeCategory.routes.js";
import ingredientRoutes from "./ingredient.routes.js";
import supplementRoutes from "./supplement.routes.js";
import dietPlanRoutes from "./dietPlan.routes.js";
import { verifyToken } from "../../../middleware/auth/token.middleware.js";

const router = Router();

router.use("/recipes/categories", recipeCategoryRoutes);
router.use("/recipes", recipeRoutes);
router.use("/ingredients", ingredientRoutes);
router.use("/supplements", supplementRoutes);
router.use("/diet-plans", dietPlanRoutes);

export default router;
