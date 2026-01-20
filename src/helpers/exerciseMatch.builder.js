export const buildBaseMatch = ({ q, status }) => {
  const match = {};

  if (q) {
    match.$or = [{ exerciseName: { $regex: q, $options: "i" } }];
  }

  if (status && status.toLowerCase() !== "all") {
    match.$expr = {
      $eq: [{ $toLower: "$status" }, status.toLowerCase()],
    };
  }

  return match;
};
