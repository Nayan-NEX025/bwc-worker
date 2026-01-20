import { stripe } from "../configs/stripeClient.config.js";
import { getOwnerByRole } from "../helpers/getOwnerByRole.js";

export const createStripeCustomer = async ({
  ownerId,
  ownerRole,
  name,
  email,
}) => {
  // You should cache stripeCustomerId in DB later (optimization)
  const customer = await stripe.customers.create({
    name,
    email,
    metadata: { ownerId: ownerId.toString(), ownerRole: ownerRole.toString() }, // webhook -> event.data.object.metadata.ownerId;
  });

  return customer;
};

export const createStripeSubscription = async ({ customerId, priceId }) => {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    collection_method: "charge_automatically",
    payment_behavior: "default_incomplete",
    payment_settings: {
      save_default_payment_method: "on_subscription", // default payment method for future subscription invoices.
    },
    expand: ["latest_invoice.payment_intent"],
  });

  return subscription;
};

export const getOrCreateStripeCustomer = async ({
  ownerId,
  ownerRole,
  email,
}) => {
  // 1️⃣ fetch user from DB
  const owner = await getOwnerByRole(ownerRole, ownerId);
  console.log("owner: ", owner); // {auth,fullName}

  if (owner.stripeCustomerId) {
    return owner.stripeCustomerId; // ✅ reuse
  }

  // 2️⃣ create Stripe customer
  const customer = await createStripeCustomer({
    ownerId,
    ownerRole,
    name: owner.fullName,
    email, // will show on chekcout page
  });

  // 3️⃣ save to DB
  owner.stripeCustomerId = customer.id;
  await owner.save();

  return customer.id;
};
