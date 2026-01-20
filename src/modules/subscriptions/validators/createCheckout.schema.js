import { z } from "zod";

export const createCheckoutSchema = z
  .object({
    planId: z.string().length(24, "Invalid planId"),

    billingCycle: z
      .string()
      .transform((v) => v.trim().toLowerCase())
      .refine((v) => ["monthly", "yearly"].includes(v), {
        message: "billingCycle must be either 'monthly' or 'yearly'",
      }),
  })
  .strict();

// refine() -> Full control
// transform + refine -> Best DX + UX
