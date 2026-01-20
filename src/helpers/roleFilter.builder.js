import Coach from "../models/coaches/coach.model.js";
import User from "../models/users/user.model.js";

export const buildRoleMatch = async (req) => {
  // 🌍 Public/unauthenticated user-> can see only admin data
  if (!req.user) {
    return { creatorModel: "Auth", status: "active" }; // admin only
  }

  const { role, _id } = req.user;

  // 👤 User -> can see its coach data and all data
  if (role === "user") {
    const user = await User.findOne({ auth: _id }).select("coach");

    return {
      $or: [
        { creatorModel: "Auth" }, // admin
        {
          creatorModel: "Coach",
          createdBy: user?.coach,
        },
      ],
    };
  }

  // 🧑‍🏫 Coach -> can se only its data
  if (role === "coach") {
    const coach = await Coach.findOne({ auth: _id }).select("_id");

    return {
      creatorModel: "Coach",
      createdBy: coach?._id,
    };
  }

  // 👑 Admin -> can see all data
  if (role === "admin") {
    return {}; // see everything
  }

  return {};
};
