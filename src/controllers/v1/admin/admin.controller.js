import { getModelByRole } from "../../../helpers/getModelByRole.js";
import { getAllUsersPipeline } from "../../../helpers/pipelines/getAllUser.pipeline.js";
import ApiError from "../../../utils/error/ApiError.js";
import { paginateWithAggregation } from "../../../utils/pagination.js";

export const getAllUsers = async (req, res) => {
  const ALLOWED_ROLES = ["user", "coach"];

  if (!ALLOWED_ROLES.includes(req.context.role)) {
    throw new ApiError("Invalid role", 400);
  }
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const pipeline = getAllUsersPipeline(
    req?.query.q,
    req?.query.status,
    req?.context.role
  );
  const Model = getModelByRole(req?.context.role);
  const { data: users, pagination } = await paginateWithAggregation(
    Model,
    pipeline,
    page,
    limit
  );

  if (!users || users.length === 0) {
    throw new ApiError("Records not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: `All ${req?.context.role}s fetched successfully`,
    pagination,
    data: users,
  });
};
