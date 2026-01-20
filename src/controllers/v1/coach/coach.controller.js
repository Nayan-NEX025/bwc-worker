import Coach from "../../../models/coaches/coach.model.js";
import ApiError from "../../../utils/error/ApiError.js";

export const getAllAvailableCoaches = async (req, res) => {
  const coaches = await Coach.find({
    status: "active",
    subscriptionStatus: "active",
    // $expr: { $lt: ["$currentClients", "$maxClients"] },
  })
    .lean()
    .select("fullName"); // can populate auth if needed

  if (!coaches) {
    throw new ApiError("No coaches found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "All coaches fetched successfully",
    data: coaches,
  });
};
