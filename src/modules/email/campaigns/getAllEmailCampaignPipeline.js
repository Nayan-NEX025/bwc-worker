export const getAllEmailCampaignPipeline = ({ q, status }) => {
  const matchStage = {};

  // 🔍 Search by campaign name (case-insensitive)
  if (q) {
    matchStage.name = { $regex: q, $options: "i" };
  }

  // 🏷 Filter by status
  if (status && status.toLowerCase() !== "all") {
    matchStage.status = status;
  }

  const pipeline = [];

  // 🔍 Search by campaign name (case-insensitive)
  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  // 📌 Sort newest first
  pipeline.push(
    {
      $sort: { createdAt: -1 },
    },

    // 👤 Join creator
    {
      $lookup: {
        from: "auths",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      },
    },

    {
      $unwind: {
        path: "$createdBy",
        preserveNullAndEmptyArrays: true,
      },
    },

    // 🎯 Shape for UI
    {
      $project: {
        name: 1,
        subject: 1,
        content: 1,
        module: 1,
        status: 1,
        recipientsType: 1,
        totalRecipients: 1,
        scheduledAt: 1,
        startedAt: 1,
        completedAt: 1,
        createdAt: 1,

        createdBy: {
          _id: "$createdBy._id",
          email: "$createdBy.email",
        },
      },
    },
  );

  return pipeline;
};
