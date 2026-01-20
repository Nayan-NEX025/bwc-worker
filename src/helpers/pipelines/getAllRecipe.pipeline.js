import { buildRoleMatch } from "../roleFilter.builder.js";

export const getAllRecipesPipeline = async ({ req, q, status }) => {
  const pipeline = [];
  const matchStage = {};

  // 1️⃣ Role-based visibility
  const roleMatch = await buildRoleMatch(req);
  if (Object.keys(roleMatch).length) {
    pipeline.push({ $match: roleMatch });
  }
  console.log(roleMatch);
  // Match filters
  if (status) {
    matchStage.status = status;
  }

  if (q) {
    matchStage.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  // Sort by newest first
  pipeline.push({
    $sort: { createdAt: -1 },
  });

  // Lookup category
  pipeline.push(
    {
      $lookup: {
        from: "recipecategories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    },
  );

  // INGREDIENT LOOKUP + MERGE
  pipeline.push(
    {
      $lookup: {
        from: "ingredients",
        let: {
          ingredientIds: {
            // ingredientIds = [ObjectId("694f6ed6aaa64a7b367c9971"), ObjectId("5ab9cbfa31c2ab715d42129e")]
            $map: {
              input: "$ingredients",
              as: "i",
              in: { $toObjectId: "$$i.ingredient" }, // {$toObjectId: "5ab9cbfa31c2ab715d42129e"} -> ObjectId("5ab9cbfa31c2ab715d42129e")
            },
          },
        },
        //From the ingredients collection, return only those documents whose _id exists in the list of ingredient IDs used by this recipe
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", "$$ingredientIds"] }, // Field values ($_id) of ingredients collection, | ariables ($$ingredientIds)
            },
          },
        ],
        as: "ingredientDetails",
      },
    },
    {
      $addFields: {
        ingredients: {
          $map: {
            input: "$ingredients",
            as: "item",
            in: {
              _id: "$$item._id",
              amount: "$$item.amount",
              unit: "$$item.unit",
              ingredient: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$ingredientDetails",
                      as: "ing",
                      cond: {
                        $eq: [
                          "$$ing._id",
                          { $toObjectId: "$$item.ingredient" },
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        ingredientDetails: 0,
      },
    },
  );

  return pipeline;
};

// $_id (current document field) => ingredient._id
// $$ingredientIds (lookup variable), $$ means lookup variable, Defined earlier using let
// $$ingredientIds === [ObjectId("694f..."), ObjectId("694f...")]
// Result of lookup | ingredientDetails: [{ "_id": "694f6ed6aaa64a7b367c9971", "name": "Salt" }]
//$$i.ingredient -> Current item in $map loop
