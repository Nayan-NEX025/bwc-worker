import { Router } from "express";
import {
  createEnquiry,
  deleteEnquiryById,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiryById,
} from "../../../controllers/v1/enquiry/index.js";

const router = Router();

router.route("/").post(createEnquiry).get(getAllEnquiries);

router
  .route("/:id")
  .get(getEnquiryById)
  .delete(deleteEnquiryById)
  .patch(updateEnquiryById);

export default router;
