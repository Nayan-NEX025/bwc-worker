import Plan from "../../models/plan.model.js";
import ApiError from "../../../../utils/error/ApiError.js";
import { paginateWithAggregation } from "../../../../utils/pagination.js";
import { getPublicPlanPipeline } from "../../pipelines/getPublicPlanPipeline.js";

export const getPublicPlans = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const targetRole = req.query.targetPlan; // user | coach
  if (!targetRole) {
    throw new ApiError("targetPlan query param is required", 400);
  }

  if (targetRole !== "user" && targetRole !== "coach") {
    throw new ApiError("Invalid target plan", 400);
  }

  const pipeline = getPublicPlanPipeline({ targetRole });

  const { data: plans, pagination } = await paginateWithAggregation(
    Plan,
    pipeline,
    page,
    limit
  );

  if (!plans || plans.length === 0) {
    throw new ApiError("Plans not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Public plans fetched successfully.",
    pagination,
    data: plans,
  });
};
