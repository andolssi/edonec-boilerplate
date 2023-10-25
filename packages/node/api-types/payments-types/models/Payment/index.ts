import { HydratedDocument, LeanDocument, Model, PipelineStage } from "mongoose";
import { IPaginatedResult, IPaginationQuery } from "shared-types";
import Stripe from "stripe";

export enum PaymentProviderEnum {
  NONE = "NONE",
  STRIPE = "STRIPE",
  PAYPAL = "PAYPAL",
  KONNECT = "KONNECT",
  PAYMEE = "PAYMEE",
  OTHER = "OTHER",
}

export enum PaymentStatus {
  INITIATED = "INITIATED",
  PENDING = "PENDING",
  FAILED = "FAILED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
  REFUNDED = "REFUNDED",
  EXPIRED = "EXPIRED",
}

export type PaymentType = {
  authId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentHistory: {
    status: PaymentStatus;
    createdAt: Date;
  }[];
  provider: {
    name: PaymentProviderEnum;
    reference: string;
    meta?: Stripe.Response<Stripe.Checkout.Session>;
  };
};
export type PaymentDocument = HydratedDocument<PaymentType>;
export type LeanPaymentDocument = LeanDocument<PaymentDocument>;
export type PaymentTypeSaticMethods = {
  findPaginated: <Item = LeanPaymentDocument>(
    this: PaymentModel,
    args: IPaginationQuery<PaymentType>,
    prependedPipelines?: PipelineStage[]
  ) => Promise<IPaginatedResult<Item>>;
};
export type PaymentModel = Model<PaymentType> & PaymentTypeSaticMethods;

export interface ErrorType {
  message: string;
}
