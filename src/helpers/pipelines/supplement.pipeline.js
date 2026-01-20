export const getSupplementPipeline = (q, status) => {
  const pipeline = [];
  const match = {};

  if (q) {
    match.name = { $regex: q, $options: "i" };
  }

  if (status && status !== "all") {
    match.status = status;
  }

  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }

  // Sort by newest first
  pipeline.push({
    $sort: { createdAt: -1 },
  });

  return pipeline;
};
