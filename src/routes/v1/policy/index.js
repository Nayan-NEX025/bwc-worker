import { Router } from "express";
import policyRoutes from "./policy.routes.js";

const router = Router();

router.use("/", policyRoutes);

export default router;