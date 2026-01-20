import Coach from "../models/coaches/coach.model.js";
import User from "../models/users/user.model.js";

export const getModelByRole = (role) => {
  switch (role) {
    case "user":
      return User;
    case "coach":
      return Coach;
    default:
      throw new ApiError("Invalid role model", 500);
  }
};
