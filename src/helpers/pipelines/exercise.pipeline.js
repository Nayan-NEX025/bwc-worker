export const getExercisePipeline = ({ matchStage }) => {
  return [
    { $match: matchStage },

    // 🔗 Muscle
    {
      $lookup: {
        from: "muscles",
        localField: "targetMuscle",
        foreignField: "_id",
        as: "targetMuscle",
      },
    },
    { $unwind: { path: "$targetMuscle", preserveNullAndEmptyArrays: true } },

    // 🔗 Exercise Type
    {
      $lookup: {
        from: "exercisetypes",
        localField: "targetExerciseType",
        foreignField: "_id",
        as: "targetExerciseType",
      },
    },
    {
      $unwind: {
        path: "$targetExerciseType",
        preserveNullAndEmptyArrays: true,
      },
    },

    // 🔗 Equipments (array)
    {
      $lookup: {
        from: "equipments",
        localField: "targetEquipments",
        foreignField: "_id",
        as: "targetEquipments",
      },
    },

    // 🔗 Machine
    {
      $lookup: {
        from: "machines",
        localField: "targetMachine",
        foreignField: "_id",
        as: "targetMachine",
      },
    },
    { $unwind: { path: "$targetMachine", preserveNullAndEmptyArrays: true } },

    // 🔗 Force
    {
      $lookup: {
        from: "forces",
        localField: "targetForce",
        foreignField: "_id",
        as: "targetForce",
      },
    },
    { $unwind: { path: "$targetForce", preserveNullAndEmptyArrays: true } },

    // 🔗 Experience Level
    {
      $lookup: {
        from: "experiencelevels",
        localField: "targetExperienceLevel",
        foreignField: "_id",
        as: "targetExperienceLevel",
      },
    },
    {
      $unwind: {
        path: "$targetExperienceLevel",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "coaches",
        localField: "createdBy",
        foreignField: "_id",
        as: "coachCreator",
      },
    },
    {
      $lookup: {
        from: "auths",
        localField: "createdBy",
        foreignField: "_id",
        as: "authCreator",
      },
    },
    {
      $addFields: {
        createdBy: {
          $cond: [
            { $eq: ["$creatorModel", "Coach"] },
            { $arrayElemAt: ["$coachCreator", 0] }, // if coach then put coach from coachCreator[0]
            { $arrayElemAt: ["$authCreator", 0] }, // if auth then put auth from authCreator[0]
          ],
        },
      },
    },
    {
      $project: {
        coachCreator: 0, // remove coachCreator
        authCreator: 0, // remove authCreator already included in createdBy
      },
    },
    // ⬇️ Sort
    { $sort: { createdAt: -1 } },
  ];
};

// $match → $sort → $skip → $limit → $lookup -> $unwind -> $addFields-> $project
