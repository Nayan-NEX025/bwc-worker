import { Router } from "express";
import nutritionRoutes from "./nutrition/index.js";
import enquiryRoutes from "./enquiry/index.js";
import authRoutes from "./auth/index.js";
import policyRoutes from "./policy/index.js";
import fitnessRoutes from "./fitness/index.js";
import adminRoutes from "./admin/index.js";
import notificationRoutes from "../../modules/notifications/routes/v1/index.js";
import blogRoutes from "../../routes/v1/blogs/index.js";
import subscriptionsRoutes from "../../modules/subscriptions/routes/v1/index.js";
import coachRequestRoutes from "../../modules/coachRequests/routes/v1/index.js";
import coachRoutes from "../../routes/v1/coach/index.js";
import planRoutes from "../../modules/plans/routes/v1/index.js";
import webhookRoutes from "./webhooks/index.js";
import emailCampaignRoutes from "../../modules/email/campaigns/index.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/nutrition", nutritionRoutes);
router.use("/enquiries", enquiryRoutes);
router.use("/policies", policyRoutes);
router.use("/fitness", fitnessRoutes);
router.use("/notifications", notificationRoutes);
router.use("/blogs", blogRoutes);
router.use("/subscriptions", subscriptionsRoutes);
router.use("/coach-requests", coachRequestRoutes);
router.use("/coaches", coachRoutes);
router.use("/plans", planRoutes);
router.use("/webhooks", webhookRoutes);
router.use("/email-campaigns", emailCampaignRoutes);

export default router;
