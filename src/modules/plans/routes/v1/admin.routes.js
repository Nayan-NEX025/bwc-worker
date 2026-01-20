import Router from "express";
import {
  createPlan,
  deletePlan,
  getAllPlan,
  getPlanById,
  updatePlan,
} from "../../controllers/v1/plans.admin.controller.js";
import { validate } from "../../../../middleware/validate.js";
import { planQuerySchema } from "../../validators/planQuery.schema.js";

const router = Router();

// api/v1/admin/plans
router
  .route("/")
  .post(createPlan)
  .get(validate({ query: planQuerySchema }), getAllPlan); // created a BUSINESS plan -> Stripe Product -> Stripe Prices

router.route("/:planId").get(getPlanById).patch(updatePlan).delete(deletePlan);

export default router;
