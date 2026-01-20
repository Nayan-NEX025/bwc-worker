import ApiError from "../../../../utils/error/ApiError.js";
import { stripe } from "../configs/stripeClient.config.js";

export const createPlanProductWithPrices = async ({
  name,
  description,
  targetRole,
  monthlyAmount,
  yearlyAmount,
  existingStripeProductId = null, //  for UPDATE flow
}) => {
  if (!monthlyAmount && !yearlyAmount) {
    throw new ApiError("At least one price (monthly or yearly) is required");
  }
  // 1️⃣ Create product
  let productId = existingStripeProductId;
  if (!productId) {
    const product = await stripe.products.create({
      // Stripe POST /v1/products
      name, // `${targetRole} Plan – ${name}`,
      description,
      metadata: { targetRole },
    });
    productId = product.id;
  }

  let monthlyPrice = null;
  let yearlyPrice = null;

  // 2️⃣ Monthly price (optional but recommended)
  if (monthlyAmount) {
    monthlyPrice = await stripe.prices.create({
      // Stripe POST /v1/prices
      unit_amount: monthlyAmount * 100, // Convert to cents | 1 USD = 100 cents
      currency: "usd",
      recurring: {
        interval: "month",
      },
      product: productId,
    });
  }

  // 3️⃣ Yearly price
  if (yearlyAmount) {
    yearlyPrice = await stripe.prices.create({
      unit_amount: yearlyAmount * 100, // Convert to cents | 1 USD = 100 cents
      currency: "usd",
      recurring: {
        interval: "year",
      },
      product: productId,
    });
  }

  return {
    stripeProductId: productId,
    monthlyPriceId: monthlyPrice?.id || null,
    yearlyPriceId: yearlyPrice?.id || null,
  };
};

export const updateStripeProduct = async ({
  stripeProductId,
  name,
  description,
}) => {
  const updatePayload = {};

  if (typeof name === "string") updatePayload.name = name;
  if (typeof description === "string") updatePayload.description = description;

  if (Object.keys(updatePayload).length === 0) return;

  await stripe.products.update(stripeProductId, updatePayload);
};
