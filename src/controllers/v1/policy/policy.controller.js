import mongoose from "mongoose";
import { Policy } from "../../../models/policy/policy.model.js";
import ApiError from "../../../utils/error/ApiError.js";

export const createPolicy = async (req, res) => {
  const { type, title, version, content } = req.body;

  const policy = await Policy.create({
    type,
    title,
    version,
    content,
    createdBy: req.user._id,
  });

  if (!policy) {
    throw new ApiError("Policy creation failed", 400);
  }

  res.status(201).json({
    success: true,
    message: "Policy created successfully",
    data: policy,
  });
};

export const getPolicyHistory = async (req, res) => {
  const policies = await Policy.find({ isDeleted: false })
    .lean()
    .sort({ createdAt: -1 });

  if (!policies || policies.length === 0) {
    throw new ApiError("No policies found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Policies fetched successfully",
    data: policies,
  });
};

export const getPolicyById = async (req, res) => {
  const policy = await Policy.findById(req.params?.id);

  if (!policy) {
    throw new ApiError("Policy not found", 404);
  }
  return res.status(200).json({
    success: true,
    message: "Policy fetched successfully",
    data: policy,
  });
};

export const updatePolicy = async (req, res) => {
  const { id } = req.params;
  const { title, version, content } = req.body;
  if (!title || !version || !content) {
    throw new ApiError("Title, version and content are required", 400);
  }
  const existingPolicy = await Policy.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!existingPolicy) {
    throw new ApiError("Policy not found", 404);
  }
  if (existingPolicy.isActive) {
    throw new ApiError(
      "Active policy cannot be updated. Create a new version instead.",
      400
    );
  }

  // 🆕 Create NEW version — inherit immutable fields
  const newPolicy = await Policy.create({
    type: existingPolicy.type, // 🔒 IMMUTABLE
    title,
    version,
    content,
    createdBy: req.user._id,
    isActive: false,
  });

  res.status(201).json({
    success: true,
    message: "New policy version created",
    data: newPolicy,
  });
};

export const deletePolicy = async (req, res) => {
  const { id } = req.params;

  const policy = await Policy.findById(id);
  if (!policy) {
    throw new ApiError("Policy not found", 404);
  }

  // Never delete active policy
  if (policy.isActive) {
    throw new ApiError("Active policy cannot be deleted", 400);
  }

  if (policy.isDeleted) {
    throw new ApiError("Policy is already deleted", 400);
  }

  policy.isDeleted = true;
  policy.deletedAt = new Date();
  policy.deletedBy = req.user._id;
  await policy.save();
  res.status(200).json({
    success: true,
    message: "Policy deleted successfully",
    data: policy,
  });
};

export const activatePolicy = async (req, res) => {
  const policy = await Policy.findById(req.params?.id);
  if (!policy) {
    throw new ApiError("Policy not found", 404);
  }

  if (policy.isActive) {
    throw new ApiError("Policy is already active", 400);
  }

  await Policy.updateMany(
    { type: policy.type, _id: { $ne: policy._id }, isDeleted: false },
    { isActive: false }
  );

  policy.isActive = true;
  policy.activatedAt = new Date();
  await policy.save();

  res.status(200).json({
    success: true,
    message: `Policy ${
      policy.isActive ? "activated" : "deactivated"
    } successfully`,
    data: policy,
  });
};
