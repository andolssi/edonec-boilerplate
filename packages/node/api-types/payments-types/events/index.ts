import { IPaginatedResult } from "shared-types";
import TCustomErrors from "shared-types/Errors";
import Stripe from "stripe";

import { PaymentType } from "../models/Payment";

export enum PaymentsEvents {
  PaymentsError = "PaymentsError",
  PaymentCreated = "PaymentCreated",
  PaymentFetched = "PaymentFetched",
  AllPaymentsFetched = "AllPaymentsFetched",
  PaymentUpdated = "PaymentUpdated",
  PaymentDeleted = "PaymentDeleted",
  StripePaymentCreated = "StripePaymentCreated",
  StripePaymentUpdated = "StripePaymentUpdated",
}

export type PaymentsEventsPayload = {
  [PaymentsEvents.PaymentsError]: TCustomErrors;
  [PaymentsEvents.PaymentCreated]: {
    payment: PaymentType;
  };
  [PaymentsEvents.PaymentUpdated]: {
    payment: PaymentType;
  };
  [PaymentsEvents.PaymentDeleted]: {
    paymentId: string;
    isPaymentDeleted: boolean;
  };
  [PaymentsEvents.PaymentFetched]: {
    payment: PaymentType;
  };
  [PaymentsEvents.AllPaymentsFetched]: {
    paginatedPayment: IPaginatedResult<PaymentType>;
  };
  [PaymentsEvents.StripePaymentUpdated]: {
    eventName: Stripe.Event.Type;
    payment: PaymentType;
  };
  [PaymentsEvents.StripePaymentCreated]: {
    payment: PaymentType;
  };
};
