// Multiple $match stages is less readable
// Single $match (MongoDB optimizer-friendly) like below
export const getPlanPipeline = ({ q, status, targetRole }) => {
  const match = {};

  // role-based visibility
  if (targetRole && targetRole.toLowerCase() === "user") {
    match.targetRole = targetRole;
  }

  if (targetRole && targetRole.toLowerCase() === "coach") {
    match.targetRole = targetRole;
  }

  // search by name
  if (q) {
    match.$or = [{ name: { $regex: q, $options: "i" } }];
  }

  // status -> isActive mapping
  if (status && status.toLowerCase() !== "all") {
    match.isActive = status.toLowerCase() === "active";
  }

  return [{ $match: match }, { $sort: { createdAt: -1 } }];
};
