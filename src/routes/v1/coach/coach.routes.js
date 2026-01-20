import { Router } from "express";
import { verifyToken } from "../../../middleware/auth/token.middleware.js";
import { getAllAvailableCoaches } from "../../../controllers/v1/coach/coach.controller.js";

const router = Router();

router.route("/available").get(verifyToken, getAllAvailableCoaches);

export default router;
