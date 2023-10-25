import FieldValidator from "field-validator";
import { Request, Response } from "http-server";
import {
  PaymentProviderEnum,
  PaymentStatus,
} from "payments-types/models/Payment";
import { PaymentRouteTypes } from "payments-types/routes/payment";
import { IMiddleware, SortDirection } from "shared-types";

export const addPayment: IMiddleware<
  Request<
    unknown,
    unknown,
    PaymentRouteTypes["/payment/"]["POST"]["body"],
    unknown
  >,
  Response<PaymentRouteTypes["/payment/"]["POST"]["response"]>
> = (req, _, next) => {
  const validators = new FieldValidator({ body: req.body });

  validators.validate.body.authId.isString();
  validators.validate.body.orderId.isString();
  validators.validate.body.amount.isNumber();
  validators.validate.body.currency.isString();
  validators.validate.body.status
    .isString()
    .isInArrayOfStrings(Object.values(PaymentStatus));
  validators.validate.body.provider.name
    .isString()
    .isInArrayOfStrings(Object.values(PaymentProviderEnum));
  validators.validate.body.provider.reference.isString();

  validators.resolveErrors();

  return next();
};

export const updatePayment: IMiddleware<
  Request<
    PaymentRouteTypes["/payment/:id"]["PUT"]["params"],
    unknown,
    PaymentRouteTypes["/payment/:id"]["PUT"]["body"],
    unknown
  >,
  Response<PaymentRouteTypes["/payment/:id"]["PUT"]["response"]>
> = (req, _, next) => {
  const validators = new FieldValidator({ body: req.body, params: req.params });

  validators.validate.body.authId.isString();
  validators.validate.body.orderId.isString();
  validators.validate.body.amount.isNumber();
  validators.validate.body.currency.isString();
  validators.validate.body.status
    .isString()
    .isInArrayOfStrings(Object.values(PaymentStatus));
  validators.validate.body.provider.name
    .isString()
    .isInArrayOfStrings(Object.values(PaymentProviderEnum));
  validators.validate.body.provider.reference.isString();

  validators.validate.params.id.isString().isValidObjectId();

  validators.resolveErrors();

  return next();
};

export const deletePayment: IMiddleware<
  Request<
    PaymentRouteTypes["/payment/:id"]["DELETE"]["params"],
    unknown,
    unknown,
    unknown
  >,
  Response<PaymentRouteTypes["/payment/:id"]["DELETE"]["response"]>
> = (req, _, next) => {
  const validators = new FieldValidator({ params: req.params });

  validators.validate.params.id.isString().isValidObjectId();

  validators.resolveErrors();

  return next();
};

export const getPayment: IMiddleware<
  Request<
    PaymentRouteTypes["/payment/:id"]["GET"]["params"],
    unknown,
    unknown,
    unknown
  >,
  Response<PaymentRouteTypes["/payment/:id"]["GET"]["response"]>
> = (req, _, next) => {
  const validators = new FieldValidator({ params: req.params });

  validators.validate.params.id.isString().isValidObjectId();

  validators.resolveErrors();

  return next();
};

export const getPayments: IMiddleware<
  Request<
    unknown,
    unknown,
    unknown,
    PaymentRouteTypes["/payment/"]["GET"]["query"]
  >,
  Response<PaymentRouteTypes["/payment/"]["GET"]["response"]>
> = (req, _, next) => {
  const validators = new FieldValidator({ query: req.query });

  validators.validate.query.page?.isNumber();
  validators.validate.query.limit?.isNumber();
  validators.validate.query["sort-direction"]
    ?.isString()
    .isInArrayOfStrings(Object.values(SortDirection));
  validators.validate.query["sort-field"]?.isString();
  validators.validate.query.keyword?.isString();

  validators.resolveErrors();

  return next();
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
> = (req, _, next) => {
  const validators = new FieldValidator({ body: req.body });

  validators.validate.body.orderId.isString();
  validators.validate.body.lineItems.forEach((o) => {
    o.productName.isString();
    o.price.isNumber();
    o.quantity.isNumber();
  });
  validators.resolveErrors();

  return next();
};
