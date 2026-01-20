import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../../../../configs/env.js";

export const stripe = new Stripe(STRIPE_SECRET_KEY);
