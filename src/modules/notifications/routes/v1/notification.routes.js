import { Router } from "express";
import { testNotification } from "../../controllers/v1/notification.controller.js";

const router = Router();

router.route("/test").post(testNotification);

export default router;
