import { COACH_APPROVAL_STATUS } from "../constants/enums/index.js";
import User from "../models/users/user.model.js";
import ApiError from "../utils/error/ApiError.js";

export const requireCoachApproval = async (req, res, next) => {
  const authId = req.user._id; // auth document
  const user = await User.findOne({ auth: authId }).lean();
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  if (!user.coach) {
    throw new ApiError("No coach selected", 400);
  }
  if (user.coachApprovalStatus === COACH_APPROVAL_STATUS.PENDING) {
    throw new ApiError("Coach approval is pending", 403);
  }
  if (user.coachApprovalStatus === COACH_APPROVAL_STATUS.REJECTED) {
    throw new ApiError("Coach approval is rejected", 403);
  }
  next();
};
