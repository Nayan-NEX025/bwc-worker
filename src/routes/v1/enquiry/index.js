import { Router } from "express";
import enquiryRoutes from "./enquiry.routes.js";

const router = Router();

router.use("/", enquiryRoutes);

export default router;
