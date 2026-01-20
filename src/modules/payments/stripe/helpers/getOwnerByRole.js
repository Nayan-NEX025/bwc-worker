import Coach from "../../../../models/coaches/coach.model.js";
import User from "../../../../models/users/user.model.js";
import ApiError from "../../../../utils/error/ApiError.js";

export const getOwnerByRole = async (ownerRole, ownerId) => {
  let owner;

  switch (ownerRole) {
    case "user":
      owner = await User.findOne({ auth: ownerId });
      break;

    case "coach":
      owner = await Coach.findOne({ auth: ownerId });
      break;

    default:
      throw new ApiError("Invalid owner role", 400);
  }

  if (!owner) {
    throw new ApiError(`${ownerRole} not found`, 404);
  }

  return owner;
};
