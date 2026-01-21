import { get } from "mongoose";
import { paginateWithAggregation } from "../../../utils/pagination.js";
import EmailCampaign from "./emailCampaign.model.js";
import {
  createBrevoEmailCampaign,
  createEmailCampaign,
} from "./emailCampaign.service.js";
import { getAllEmailCampaignPipeline } from "./getAllEmailCampaignPipeline.js";
import ApiError from "../../../utils/error/ApiError.js";

export const createEmailCampaignController = async (req, res, next) => {
  const campaign = await createEmailCampaign(req.body, req.user);

  return res.status(202).json({
    success: true,
    message: "Email campaign queued successfully",
    data: {
      campaignId: campaign._id,
      status: campaign.status,
      totalRecipients: campaign.totalRecipients,
    },
  });
};

export const getAllEmailCampaigns = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { q, status } = req.query;

  const pipeline = getAllEmailCampaignPipeline({ q, status });
  console.log(pipeline);
  const { data: campaigns, pagination } = await paginateWithAggregation(
    EmailCampaign,
    pipeline,
    page,
    limit,
  );

  if (!campaigns || campaigns.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No email campaigns found",
      data: [],
    });
  }
  return res.status(200).json({
    success: true,
    message: "Email campaigns fetched successfully",
    meta: {
      pagination,
    },
    data: campaigns,
  });
};

export const deleteEmailCampaign = async (req, res, next) => {
  const deletedCampaign = await EmailCampaign.findByIdAndDelete(req.params.id);

  if (!deletedCampaign) {
    throw new ApiError("Email campaign not found", 404);
  }
  return res.status(200).json({
    success: true,
    message: "Email campaign deleted successfully",
  });
};

export const createBrevoEmailCampaignController = async (req, res, next) => {
  const campaign = await createBrevoEmailCampaign(req.body, req.user);

  return res.status(202).json({
    success: true,
    message: "Email campaign queued successfully",
    data: {
      campaignId: campaign._id,
      status: campaign.status,
      totalRecipients: campaign.totalRecipients,
    },
  });
};
