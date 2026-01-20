import Coach from "../../../../models/coaches/coach.model.js";
import CoachClient from "../../../../models/coaches/coachClient.model.js";
import User from "../../../../models/users/user.model.js";
import ApiError from "../../../../utils/error/ApiError.js";

// send notification too
export const createCoachRequest = async (req, res) => {
  const { coachId } = req.body;
  const user = await User.findOne({ auth: req.user._id });
  if (!user) throw new ApiError("User profile not found", 404);

  if (user.coachStatus === "active") {
    throw new ApiError("You already have a coach", 400);
  }

  const coach = await Coach.findById(coachId);
  if (!coach) throw new ApiError("Coach not found", 404);

  if (coach.status !== "active" || coach.subscriptionStatus !== "active") {
    throw new ApiError("Coach is not available", 400);
  }

  if (coach.currentClients >= coach.maxClients) {
    throw new ApiError("Coach has reached max capacity", 400);
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

// send notification too for user | domain data _id
export const approveCoachRequest = async (req, res) => {
  const { requestId } = req.params;

  // 1️⃣ Get coach DOMAIN doc using auth id
  const coach = await Coach.findOne({ auth: req.user._id });
  if (!coach) throw new ApiError("Coach profile not found", 404);

  // 2️⃣ Get request
  const request = await CoachClient.findById(requestId);
  if (!request) throw new ApiError("Request not found", 404);

  // 3️⃣ Ownership check (DOMAIN id vs DOMAIN id)
  if (request.coach.toString() !== coach._id.toString()) {
    throw new ApiError("Not authorized to approve this request", 403);
  }

  // coach can approve only pending requests
  if (request.status !== "pending") {
    throw new ApiError("Request already processed", 400);
  }

  request.status = "approved";
  request.approvedAt = new Date();
  await request.save();

  // ✅ increment active clients
  await Coach.findByIdAndUpdate(coach._id, {
    $inc: { currentClients: 1 },
  });

  // 5️⃣ Activate user
  const user = await User.findByIdAndUpdate(
    request.user,
    {
      coach: coach._id,
      coachStatus: "active",
    },
    { new: true }
  ).populate("auth", "email phoneNumber"); // ✅ identity data

  res.status(200).json({
    success: true,
    message: "User approved successfully",
  });
};

export const getCoachRequests = async (req, res) => {
  // req.user._id = auth id
  const coach = await Coach.findOne({ auth: req?.user?._id });
  if (!coach) throw new ApiError("Coach profile not found", 404);

  const requests = await CoachClient.find({
    coach: coach._id,
    status: "pending",
  })
    .select("user status createdAt")
    .populate({
      path: "user",
      select: "fullName",
      populate: {
        path: "auth",
        select: "email phoneNumber",
      },
    });

  if (!requests || requests.length === 0) {
    return res.json({
      success: true,
      message: "No requests found",
      data: [],
    });
  }
  res.json({
    success: true,
    message: "All Requests fetched successfully",
    data: requests,
  });
};

// send notification too
export const rejectCoachRequest = async (req, res) => {
  const { requestId } = req.params;

  // 1️⃣ Get coach DOMAIN doc using auth id
  const coach = await Coach.findOne({ auth: req.user._id });
  if (!coach) throw new ApiError("Coach profile not found", 404);

  // 2️⃣ Get request
  const request = await CoachClient.findById(requestId);
  if (!request) throw new ApiError("Request not found", 404);

  // 3️⃣ Ownership check (DOMAIN id vs DOMAIN id)
  if (request.coach.toString() !== coach._id.toString()) {
    throw new ApiError("Not authorized to reject this request", 403);
  }

  // coach can reject only pending requests
  if (request.status !== "pending") {
    throw new ApiError("Request already processed", 400);
  }

  request.status = "rejected";
  request.rejectedAt = new Date();
  await request.save();

  // Optional: reset user coachStatus if you set it on request

  res.status(200).json({
    success: true,
    message: "Request rejected successfully",
  });
};
