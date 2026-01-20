import { Router } from "express";
import { createSubscriptionCheckout } from "../../controllers/v1/subscriptions.controller.js";
import { verifyToken } from "../../../../middleware/auth/token.middleware.js";
import { ROLES } from "../../../../constants/enums/index.js";
import { authorizeRoles } from "../../../../middleware/auth/role.middleware.js";
import { validate } from "../../../../middleware/validate.js";
import { createCheckoutSchema } from "../../validators/createCheckout.schema.js";

const router = Router();

router.use(verifyToken, authorizeRoles([ROLES.COACH, ROLES.USER]));

router
  .route("/checkout")
  .post(validate({ body: createCheckoutSchema }), createSubscriptionCheckout);

export default router;
