export const getAllUsersPipeline = (q, status, role) => {
  const roleFilter = role === "user" ? "user" : "coach";
  console.log("pipeline: ", roleFilter);
  return [
    // 1️⃣ Populate auth
    {
      $lookup: {
        from: "auths",
        localField: "auth",
        foreignField: "_id",
        as: "auth",
      },
    },

    // 2️⃣ Flatten auth array
    {
      $unwind: {
        path: "$auth",
        preserveNullAndEmptyArrays: false,
      },
    },
    // 3️⃣ Apply match AFTER lookup
    {
      $match: {
        "auth.role": roleFilter,
        ...(status && { status }),
        ...(q && {
          $or: [
            { fullName: { $regex: q, $options: "i" } },
            { "auth.email": { $regex: q, $options: "i" } },
          ],
        }),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "activeSubscription",
        foreignField: "_id",
        as: "subscription",
      },
    },
    {
      $unwind: {
        path: "$subscription",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "plans",
        localField: "subscription.planId",
        foreignField: "_id",
        as: "plan",
      },
    },
    {
      $unwind: {
        path: "$plan",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        planName: "$plan.name",
      },
    },
    {
      $project: {
        plan: 0,
      },
    },

    { $sort: { createdAt: -1 } },
  ];
};
