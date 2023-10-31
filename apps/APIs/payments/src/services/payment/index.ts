import stripe from "api";
import { NotFoundError } from "custom-error";
import producer from "events/producer";
import Payment from "models/Payment";
import {
  ErrorType,
  PaymentProviderEnum,
  PaymentStatus,
} from "payments-types/models/Payment";
import { PaymentRouteTypes } from "payments-types/routes/payment";
import { ACCESS_RESSOURCES } from "shared-types";
import Stripe from "stripe";

const CURRENCY = "usd";
const HALF_HOUR_IN_SECONDS = 1800;
const YOUR_DOMAIN = "https://localhost:3000/";

export const updateStripePayment = async ({
  paymentIntent,
  status,
  eventName,
}: {
  paymentIntent: Stripe.Checkout.Session | Stripe.PaymentIntent;
  status: PaymentStatus;
  eventName: Stripe.Event.Type;
}) => {
  const paymentUpdated = await Payment.findOneAndUpdate(
    {
      "provider.reference": paymentIntent.id,
    },
    {
      status,
      "provider.meta": paymentIntent,
      $push: {
        paymentHistory: { status, createdAt: new Date() },
      },
    },
    { returnOriginal: false }
  );

  if (!paymentUpdated) {
    console.log(
      `!!!!There is no payment Document with this payment intent Id ${paymentIntent.id} and that ok if this event //${eventName}// is payment Intent succeeded `
    );

    return;
  }

  producer.emit.StripePaymentUpdated({ eventName, payment: paymentUpdated });
};

const userStripeId = async (authId: string) => {
  const stripeCustomerFound = await stripe.customers.search({
    query: `metadata['authId']:'${authId}'`,
  });

  if (stripeCustomerFound.data[0]) {
    return stripeCustomerFound.data[0].id;
  }

  if (!authId)
    throw new Error(
      `auth is ${authId} We can't create customer without the auth ID \n
      (error location : APIs/payments/src/services/payment/index.ts : Line 64) `
    );

  const stripeCustomer = await stripe.customers.create({
    description:
      "We use this to track payments that belong to the same customer",
    metadata: { authId },
  });

  return stripeCustomer.id;
};

export const addPayment = async (
  paymentData: PaymentRouteTypes["/payment/"]["POST"]["body"]
) => {
  const newPayment = await Payment.create(paymentData);

  producer.emit.PaymentCreated({ payment: newPayment });
};

export const updatePayment = async (
  paymentId: string,
  paymentData: PaymentRouteTypes["/payment/:id"]["PUT"]["body"]
) => {
  const payment = await Payment.findByIdAndUpdate(paymentId, paymentData);

  if (!payment)
    throw new NotFoundError({
      message: "payment not found",
      ressource: ACCESS_RESSOURCES.PAYMENT,
    });

  producer.emit.PaymentUpdated({ payment });

  return payment;
};

export const deletePayment = async (paymentId: string) => {
  const payment = await Payment.deleteOne({ _id: paymentId });

  if (!payment)
    throw new NotFoundError({
      message: "payment not found",
      ressource: ACCESS_RESSOURCES.PAYMENT,
    });

  producer.emit.PaymentDeleted({
    paymentId,
    isPaymentDeleted: payment.acknowledged,
  });

  return payment;
};

export const getPayment = async (
  paymentId: string
): Promise<PaymentRouteTypes["/payment/:id"]["GET"]["response"]> => {
  const payment = await Payment.findById(paymentId).lean();

  if (!payment)
    throw new NotFoundError({
      message: "payment not found",
      ressource: ACCESS_RESSOURCES.PAYMENT,
    });

  producer.emit.PaymentFetched({ payment });

  return payment;
};

export const getPayments = async (
  query: PaymentRouteTypes["/payment/"]["GET"]["query"]
): Promise<PaymentRouteTypes["/payment/"]["GET"]["response"]> => {
  const paginatedPayment = await Payment.findPaginated(query);

  producer.emit.AllPaymentsFetched({ paginatedPayment });

  return paginatedPayment;
};

export const addCreateCheckoutSession = async (
  body: {
    orderId: string;
    lineItems: { productName: string; price: number; quantity: number }[];
  },
  authId: string
): Promise<
  PaymentRouteTypes["/payment/create-checkout-session"]["POST"]["response"]
> => {
  if (!process.env.TERMS_OF_SERVICE_LINK)
    throw new Error("Missing required .env variables");

  const customerId = await userStripeId(authId);

  const totalAmount = body.lineItems.reduce((acc, item) => {
    const subtotal = item.price * item.quantity;

    return acc + subtotal;
  }, 0);

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    mode: "payment",
    customer: customerId,
    return_url: `${YOUR_DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}`,
    expires_at: Math.floor(Date.now() / 1000) + HALF_HOUR_IN_SECONDS,
    consent_collection: {
      terms_of_service: "required",
    },
    custom_text: {
      terms_of_service_acceptance: {
        message: `I agree to the [Terms of Service](${process.env.TERMS_OF_SERVICE_LINK})`,
      },
    },
    line_items: body.lineItems.map((el) => ({
      price_data: {
        currency: CURRENCY,
        product_data: {
          name: el.productName,
        },
        unit_amount: el.price,
      },
      quantity: el.quantity,
    })),
  });

  const newPayment = await Payment.create({
    authId,
    amount: totalAmount,
    currency: CURRENCY,
    orderId: body.orderId,
    status: PaymentStatus.INITIATED,
    paymentHistory: [
      {
        status: PaymentStatus.INITIATED,
        createdAt: new Date(),
      },
    ],
    provider: {
      name: PaymentProviderEnum.STRIPE,
      reference: session.id,
      meta: session,
    },
  });

  if (!session.client_secret) throw new Error("Missing checkout URL!!");

  producer.emit.StripePaymentCreated({ payment: newPayment });

  return {
    clientSecret: session.client_secret,
    paymentId: newPayment._id.toString(),
  };
};

export const addWebhook = async (
  payload: Stripe.EventBase,
  // eslint-disable-next-line unused-imports/no-unused-vars
  stripeSignature: string | string[]
): Promise<PaymentRouteTypes["/payment/webhook"]["POST"]["response"]> => {
  if (!process.env.ENDPOINT_SECRET)
    throw new Error("Missing required .env variables");

  const header = stripe.webhooks.generateTestHeaderString({
    payload: JSON.stringify(payload),
    secret: process.env.ENDPOINT_SECRET,
  });

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      JSON.stringify(payload),
      header,
      process.env.ENDPOINT_SECRET
    );
  } catch (err) {
    throw new Error(`Webhook Error: ${(err as ErrorType).message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      if (session.payment_status === "paid") {
        const status = PaymentStatus.COMPLETED;

        await Payment.findOneAndUpdate(
          {
            "provider.reference": session.id,
          },
          {
            status,
            "provider.meta": session,
            $push: {
              paymentHistory: { status, createdAt: new Date() },
            },
            "provider.reference": session.payment_intent,
          }
        );
      }

      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;

      updateStripePayment({
        paymentIntent,
        status: PaymentStatus.COMPLETED,
        eventName: "payment_intent.succeeded",
      });

      break;
    }

    case "payment_intent.processing": {
      const paymentIntent = event.data.object;

      updateStripePayment({
        paymentIntent,
        status: PaymentStatus.PENDING,
        eventName: "payment_intent.processing",
      });

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;

      updateStripePayment({
        paymentIntent,
        status: PaymentStatus.FAILED,
        eventName: "payment_intent.payment_failed",
      });

      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;

      updateStripePayment({
        paymentIntent: session,
        status: PaymentStatus.EXPIRED,
        eventName: "checkout.session.expired",
      });

      break;
    }
    case "payment_intent.canceled": {
      const paymentIntent = event.data.object;

      const paymentUpdated = await Payment.findOne({
        "provider.reference": paymentIntent.id,
      });

      if (!paymentUpdated) break;

      producer.emit.StripePaymentUpdated({
        eventName: "payment_intent.canceled",
        payment: paymentUpdated,
      });

      break;
    }
    default: {
      // eslint-disable-next-line no-console
      console.log("We Don't handle this event ..............................", {
        event: event.type,
      });

      break;
    }
  }

  return event.type;
};

export const createPaymentIntent = async (
  orderId: string,
  authId: string,
  orderAmount: number
): Promise<
  PaymentRouteTypes["/payment/create-payment-intent"]["POST"]["response"]
> => {
  const customerId = await userStripeId(authId);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: orderAmount,
    currency: CURRENCY,
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
    customer: customerId,
  });

  if (!paymentIntent.client_secret) throw new Error("Missing client_secret !!");

  const newPayment = await Payment.create({
    authId,
    amount: orderAmount,
    currency: CURRENCY,
    orderId,
    status: PaymentStatus.INITIATED,
    paymentHistory: [
      {
        status: PaymentStatus.INITIATED,
        createdAt: new Date(),
      },
    ],
    provider: {
      name: PaymentProviderEnum.STRIPE,
      reference: paymentIntent.id,
      meta: paymentIntent,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentId: newPayment._id.toString(),
  };
};

export const cancelPaymentIntent = async (paymentIntentId: string) => {
  const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

  if (!paymentIntent || !(paymentIntent.status === "canceled"))
    throw new Error("Missing Payment Intent or not canceled !!");
};