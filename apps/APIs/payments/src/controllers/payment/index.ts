import { Request, Response } from "http-server";
import { PaymentRouteTypes } from "payments-types/routes/payment";
import * as paymentService from "services/payment";
import { IMiddleware, StatusCodes } from "shared-types";

export const addPayment: IMiddleware<
  Request<
    unknown,
    unknown,
    PaymentRouteTypes["/payment/"]["POST"]["body"],
    unknown
  >,
  Response<PaymentRouteTypes["/payment/"]["POST"]["response"]>
> = async (req, res) => {
  await paymentService.addPayment(req.body);

  res.status(StatusCodes.Created).send("OK");
};

export const updatePayment: IMiddleware<
  Request<
    PaymentRouteTypes["/payment/:id"]["PUT"]["params"],
    unknown,
    PaymentRouteTypes["/payment/:id"]["PUT"]["body"],
    unknown
  >,
  Response<PaymentRouteTypes["/payment/:id"]["PUT"]["response"]>
> = async (req, res) => {
  await paymentService.updatePayment(req.params.id, req.body);

  res.status(StatusCodes.OK).send("OK");
};

export const deletePayment: IMiddleware<
  Request<
    PaymentRouteTypes["/payment/:id"]["DELETE"]["params"],
    unknown,
    unknown,
    unknown
  >,
  Response<PaymentRouteTypes["/payment/:id"]["DELETE"]["response"]>
> = async (req, res) => {
  await paymentService.deletePayment(req.params.id);

  res.status(StatusCodes.OK).send("OK");
};

export const getPayment: IMiddleware<
  Request<
    PaymentRouteTypes["/payment/:id"]["GET"]["params"],
    unknown,
    unknown,
    unknown
  >,
  Response<PaymentRouteTypes["/payment/:id"]["GET"]["response"]>
> = async (req, res) => {
  const response = await paymentService.getPayment(req.params.id);

  res.status(StatusCodes.OK).send(response);
};

export const getPayments: IMiddleware<
  Request<
    unknown,
    unknown,
    unknown,
    PaymentRouteTypes["/payment/"]["GET"]["query"]
  >,
  Response<PaymentRouteTypes["/payment/"]["GET"]["response"]>
> = async (req, res) => {
  const response = await paymentService.getPayments(req.query);

  res.status(StatusCodes.OK).send(response);
};

export const addCreateCheckoutSession: IMiddleware<
  Request<
    unknown,
    unknown,
    PaymentRouteTypes["/payment/create-checkout-session"]["POST"]["body"],
    unknown
  >,
  Response<
    PaymentRouteTypes["/payment/create-checkout-session"]["POST"]["response"]
  >
> = async (req, res) => {
  const authID: string = res.locals.token.decodedToken.payload.authId;

  const response = await paymentService.addCreateCheckoutSession(
    req.body,
    authID
  );

  res.status(StatusCodes.Created).send(response);
};

export const addWebhook: IMiddleware<
  Request<
    unknown,
    unknown,
    PaymentRouteTypes["/payment/webhook"]["POST"]["body"],
    unknown
  >,
  Response<PaymentRouteTypes["/payment/webhook"]["POST"]["response"]>
> = async (req, res) => {
  const stripeSignature = req.headers["stripe-signature"];

  if (!stripeSignature) {
    res
      .status(StatusCodes["Bad Gateway"])
      .send("stripe-signature is missing!!");

    return "stripe-signature is missing!!";
  }

  const response = await paymentService.addWebhook(req.body, stripeSignature);

  res.status(StatusCodes.Created).send(response);
};
