import Stripe from "stripe";

const API_VERSION = "2023-10-16";

if (!process.env.STRIPE_SECRET_KEY)
  throw new Error("Missing required .env variables");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: API_VERSION,
});

export default stripe;
