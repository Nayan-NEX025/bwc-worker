import { Router } from "express";
import coachRoutes from "./coach.routes.js";

const router = Router();

router.use("/", coachRoutes);

export default router;
