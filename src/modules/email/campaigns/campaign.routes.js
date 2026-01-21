import { Router } from "express";
import { verifyToken } from "../../../middleware/auth/token.middleware.js";
import { authorizeRoles } from "../../../middleware/auth/role.middleware.js";
import {
  createBrevoEmailCampaignController,
  createEmailCampaignController,
  deleteEmailCampaign,
  getAllEmailCampaigns,
} from "./campaign.controller.js";
import { ROLES } from "../../../constants/enums/roles.enum.js";

const router = Router();

router
  .route("/")
  .post(
    verifyToken,
    authorizeRoles([ROLES.ADMIN]),
    createEmailCampaignController,
  )
  .get(verifyToken, authorizeRoles([ROLES.ADMIN]), getAllEmailCampaigns);

router
  .route("/brevo")
  .post(
    verifyToken,
    authorizeRoles([ROLES.ADMIN]),
    createBrevoEmailCampaignController,
  );

router
  .route("/:id")
  .delete(verifyToken, authorizeRoles([ROLES.ADMIN]), deleteEmailCampaign);

export default router;
