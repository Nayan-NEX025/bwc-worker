import Coach from "../../../models/coaches/coach.model.js";
import CoachClient from "../../../models/coaches/coachClient.model.js";
import User from "../../../models/users/user.model.js";
import ApiError from "../../../utils/error/ApiError.js";

// send notification too
export const requestCoach = async (req, res) => {
  const { coachId } = req.body;
  const user = await User.findOne({ auth: req.user._id });
  if (!user) throw new ApiError("User profile not found", 404);

  const coach = await Coach.findById(coachId);
  if (!coach) throw new ApiError("Coach not found", 404);

  if (coach.subscriptionStatus !== "active") {
    throw new ApiError("Coach is not available", 400);
  }

  const request = await CoachClient.create({
    coach: coach._id,
    user: user._id,
  });

  res.json({
    success: true,
    message: "Coach request sent",
  });
};
