import { generatePagesArray } from "./generatePagesArray.js";

export const paginateWithAggregation = async (
  model,
  pipeline = [],
  page = 1,
  limit = 5
) => {
  const skip = (page - 1) * limit;

  const finalPipeline = [
    ...pipeline,
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
    {
      $addFields: {
        total: { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] }, // $ifNull: [<value>, <fallback>] | [null, 0] if null, then 0
      },
    },
  ];

  const result = await model.aggregate(finalPipeline);
  const { data = [], total = 0 } = result[0] || {};

  const totalPages = Math.ceil(total / limit);
  const pagesArray = generatePagesArray(totalPages, page);

  const pagination = {
    total,
    current_page: page,
    limit,
    next: page < totalPages ? page + 1 : null,
    prev: page > 1 ? page - 1 : null,
    pages: pagesArray,
  };

  return { data, pagination };
};
