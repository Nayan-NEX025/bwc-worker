import { Router } from "express";
import authRoutes from "./auth.routes.js";

const router = Router();

router.use("/", authRoutes); // This file’s job is grouping auth routes

export default router;
