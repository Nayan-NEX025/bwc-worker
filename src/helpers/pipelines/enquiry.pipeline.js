export const getEnquiryPipeline = (q, status) => {
  const matchStage = [];
  if (q) {
    matchStage.push({
      $match: {
        $or: [
          { fullName: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { message: { $regex: q, $options: "i" } },
        ],
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

  //   console.log("match stage: ", JSON.stringify(matchStage, null, 2));
  return [
    {
      $match: matchStage.length
        ? { $and: matchStage.map((stage) => stage.$match) }
        : {},
    },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        _id: 1,
        fullName: 1,
        email: 1,
        phone: 1,
        message: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];
};
