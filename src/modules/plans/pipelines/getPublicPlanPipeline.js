export const getPublicPlanPipeline = ({ q, targetRole } = {}) => {
  const match = {};

  if (typeof targetRole === "string") {
    const role = targetRole.toLowerCase();

    if (role === "user" || role === "coach") {
      match.targetRole = role;
    }
  }

  // public users see ONLY active plans
  match.isActive = true;

  if (typeof q === "string" && q.trim() !== "") {
    match.$or = [
      {
        name: { $regex: q, $options: "i" },
      },
    ];
  }

  return [{ $match: match }, { $sort: { createdAt: -1 } }];
};
