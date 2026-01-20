import { Router } from "express";
import { getPublicPlans } from "../../controllers/v1/plans.controller.js";

const router = Router();

router.route("/").get(getPublicPlans);

export default router;
