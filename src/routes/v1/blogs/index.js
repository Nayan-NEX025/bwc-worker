import { Router } from "express";
import BlogRoutes from "./blog.routes.js";

const router = Router();

router.use("/", BlogRoutes);

export default router;
