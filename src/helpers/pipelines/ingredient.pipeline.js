export const getIngredientPipeline = (q, status) => {
  const matchStage = [];
  if (q) {
    matchStage.push({
      $match: {
        name: { $regex: q, $options: "i" },
      },
    });
  }
  if (status && status.toLowerCase() !== "all") {
    matchStage.push({
      $match: {
        $expr: { $eq: [{ $toLower: "$status" }, status.toLowerCase()] },
      },
    });
  }

  return [
    {
      $match: matchStage.length
        ? { $and: matchStage.map((stage) => stage.$match) }
        : {},
    },
    { $sort: { createdAt: -1 } },
  ];
};
