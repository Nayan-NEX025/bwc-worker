import ApiError from "../../../utils/error/ApiError.js";
import Enquiry from "../../../models/enquiryForm/enquiry.model.js";
import { getEnquiryPipeline } from "../../../helpers/pipelines/enquiry.pipeline.js";
import { paginateWithAggregation } from "../../../utils/pagination.js";
import { ENQUIRY_STATUS_VALUES } from "../../../constants/enums/enquiry.enum.js";

// Needed to add notification feature later
export const createEnquiry = async (req, res) => {
  const enquiry = await Enquiry.create(req.body);

  if (!enquiry) {
    throw new ApiError("Failed to create enquiry. Please try again.", 400);
  }

  return res.status(201).json({
    success: true,
    message: "Enquiry submitted successfully",
    data: enquiry,
  });
};

export const getEnquiryById = async (req, res, next) => {
  const enquiry = await Enquiry.findById(req.params?.id).lean();

  if (!enquiry) {
    throw new ApiError(404, "Enquiry not found");
  }

  return res.status(200).json({
    success: true,
    message: "Enquiry fetched successfully",
    data: enquiry,
  });
};

export const deleteEnquiryById = async (req, res, next) => {
  const enquiry = await Enquiry.findByIdAndDelete(req.params?.id);

  if (!enquiry) {
    throw new ApiError("Enquiry not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Enquiry deleted successfully",
  });
};

export const getAllEnquiries = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const q = req.query.q || null;
  const status = req.query.status || null;

  const pipeline = getEnquiryPipeline(q, status);

  const { data: enquiries, pagination } = await paginateWithAggregation(
    Enquiry,
    pipeline,
    page,
    limit
  );

  if (!enquiries || enquiries.length === 0) {
    throw new ApiError("Enquiries not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "All enquiries fetched successfully.",
    pagination,
    data: enquiries,
  });
};

export const updateEnquiryById = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status && !ENQUIRY_STATUS_VALUES.includes(status)) {
    throw new ApiError("Invalid enquiry status", 400);
  }

  const updatedEnquiry = await Enquiry.findByIdAndUpdate(
    id,
    {
      ...req.body,
      ...(status && { status }),
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (!updatedEnquiry) {
    throw new ApiError("Enquiry not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Enquiry updated successfully",
    data: updatedEnquiry,
  });
};
