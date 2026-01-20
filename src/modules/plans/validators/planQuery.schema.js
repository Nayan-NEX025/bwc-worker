import { z } from "zod";

export const planQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),

  status: z.enum(["active", "inactive", "all"]).optional(),

  targetPlan: z.enum(["user", "coach"]).optional(),
});
