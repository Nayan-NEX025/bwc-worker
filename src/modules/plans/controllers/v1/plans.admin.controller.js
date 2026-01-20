import ApiError from "../../../../utils/error/ApiError.js";
import { paginateWithAggregation } from "../../../../utils/pagination.js";
import {
  createPlanProductWithPrices,
  updateStripeProduct,
} from "../../../payments/stripe/services/product.service.js";
import Plan from "../../models/plan.model.js";
import { getPlanPipeline } from "../../pipelines/getPlanPipeline.js";

// support two admin workflows:
// ✅ Auto-create Stripe product (backend creates it)
// ✅ Use existing Stripe product (admin already created it in Stripe Dashboard)
export const createPlan = async (req, res) => {
  const {
    name,
    description,
    clientCap,
    targetRole,
    planTag,
    monthlyAmount,
    yearlyAmount,
    shouldCreateStripeProduct,
    stripeProductId, // only if shouldCreateStripeProduct = false
    monthlyPriceId, // only if shouldCreateStripeProduct = false
    yearlyPriceId, // only if shouldCreateStripeProduct = false
  } = req.body;

  if (!["user", "coach"].includes(targetRole)) {
    throw new ApiError("Invalid target role", 400);
  }

  let productId = stripeProductId;
  let monthlyId = monthlyPriceId;
  let yearlyId = yearlyPriceId;

  if (shouldCreateStripeProduct) {
    if (!monthlyAmount) {
      throw new ApiError("Monthly amount required for Stripe product creation");
    }
    console.time(); // Time taken = 1.099s
    const stripeData = await createPlanProductWithPrices({
      name,
      description,
      targetRole,
      monthlyAmount,
      yearlyAmount,
    });
    console.timeEnd();
    productId = stripeData.stripeProductId;
    monthlyId = stripeData.monthlyPriceId;
    yearlyId = stripeData.yearlyPriceId;
  } else {
    if (!productId || !monthlyId) {
      throw new ApiError(
        "Stripe product ID and monthly price ID are required for existing Stripe product to create a plan"
      );
    }
  }

  if (!productId || !monthlyId) {
    throw new ApiError("Stripe product & prices are required");
  }

  const plan = await Plan.create({
    name,
    description,
    targetRole,
    clientCap: targetRole === "coach" ? clientCap : undefined,
    planTag,
    stripeProductId: productId,
    monthlyPriceId: monthlyId,
    yearlyPriceId: yearlyId,
    isActive: true,
    createdBy: req.user._id,
    updatedBy: req.user._id,
    monthlyAmount: monthlyAmount * 100,
    yearlyAmount: (yearlyAmount && yearlyAmount * 100) || undefined,
  });

  res.status(201).json({
    success: true,
    message: "Plan created successfully",
    data: plan,
  });
};

export const getAllPlan = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { q, status, targetPlan } = req.validated.query;
  const pipeline = getPlanPipeline({ q, status, targetRole: targetPlan });
  const { data: plans, pagination } = await paginateWithAggregation(
    Plan,
    pipeline,
    page,
    limit
  );
  if (!plans || plans.length === 0) {
    throw new ApiError("Plans not found", 404);
  }
  return res.status(200).json({
    success: true,
    message: "All plans fetched successfully.",
    pagination,
    data: plans,
  });
};

export const getPlanById = async (req, res) => {
  const { planId } = req.params;
  const plan = await Plan.findById(planId);
  if (!plan) {
    throw new ApiError("Plan not found", 404);
  }
  return res.status(200).json({
    success: true,
    message: "Plan fetched successfully.",
    data: plan,
  });
};

// SOFT DELETE - Do not delete the plan user is subscribed to, Stripe will still have the product, but your DB won’t.
export const deletePlan = async (req, res) => {
  const { planId } = req.params;

  const plan = await Plan.findByIdAndUpdate(
    planId,
    { isActive: false },
    { new: true }
  );

  if (!plan) {
    throw new ApiError("Plan not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Plan archived successfully.",
  });
};

export const updatePlan = async (req, res) => {
  const { planId } = req.params;
  const {
    name,
    description,
    planTag,
    clientCap,
    isActive,
    monthlyAmount,
    yearlyAmount,
    shouldCreateNewPrices,
  } = req.body;

  const plan = await Plan.findById(planId);
  if (!plan) {
    throw new ApiError("Plan not found", 404);
  }

  if ((name || description) && plan.stripeProductId) {
    await updateStripeProduct({
      stripeProductId: plan.stripeProductId,
      name,
      description,
    });
  }

  if (name) plan.name = name;
  if (description) plan.description = description;
  if (planTag) plan.planTag = planTag;
  if (clientCap) plan.clientCap = clientCap;
  if (isActive !== undefined) plan.isActive = isActive;
  if (monthlyAmount) plan.monthlyAmount = monthlyAmount * 100;
  if (yearlyAmount) plan.yearlyAmount = yearlyAmount * 100;
  if (shouldCreateNewPrices) {
    if (!plan.stripeProductId) {
      throw new ApiError("Stripe product not linked with this plan", 400);
    }

    if (!monthlyAmount && !yearlyAmount) {
      throw new ApiError(
        "At least one amount (monthly or yearly) is required to create new prices",
        400
      );
    }
    const stripeData = await createPlanProductWithPrices({
      name: plan.name,
      description: plan.description,
      targetRole: plan.targetRole,
      monthlyAmount,
      yearlyAmount,
      existingStripeProductId: plan.stripeProductId, // 🔒 reuse product
    });

    if (stripeData.monthlyPriceId) {
      plan.monthlyPriceId = stripeData.monthlyPriceId;
    }

    if (stripeData.yearlyPriceId) {
      plan.yearlyPriceId = stripeData.yearlyPriceId;
    }
  }
  plan.updatedBy = req.user._id;
  await plan.save();

  return res.status(200).json({
    success: true,
    message: "Plan updated successfully",
    data: plan,
  });
};

// Stripe products are immutable identifiers for billing history, so updates only create new prices
// under the same product rather than creating new products.
// Stripe prices are immutable
// Existing subscriptions are safe - Old users stay on old price | New users get new price
// API: createPlan ->  new product + prices || updatePlan -> same product + new prices
