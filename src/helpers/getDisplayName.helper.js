import User from "../models/users/user.model.js";
import Coach from "../models/coaches/coach.model.js";
import { ROLES } from "../constants/enums/roles.enum.js";

export const getDisplayNameByAuth = async (auth) => {
  switch (auth.role) {
    case ROLES.USER: {
      const user = await User.findOne({ auth: auth._id }).select("fullName");
      return user?.fullName || "User";
    }

    case ROLES.COACH: {
      const coach = await Coach.findOne({ auth: auth._id }).select("fullName");
      return coach?.fullName || "Coach";
    }

    case ROLES.ADMIN:
      return "Admin";

    default:
      return "User";
  }
};
