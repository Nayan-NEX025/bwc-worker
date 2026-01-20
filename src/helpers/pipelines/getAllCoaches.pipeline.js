export const getAllCoachesPipeline = (q, status) => {
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
        "auth.role": "coach",
        ...(status && { status }),
        ...(q && {
          $or: [
            { fullName: { $regex: q, $options: "i" } },
            { "auth.email": { $regex: q, $options: "i" } },
          ],
        }),
      },
    },

    // 4️⃣ Sort latest first
    {
      $sort: { createdAt: -1 },
    },
  ];
};
