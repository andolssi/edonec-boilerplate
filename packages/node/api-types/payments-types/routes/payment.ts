import { LeanDocument, Types } from "mongoose";
import { IPaginatedResult } from "shared-types";
import Stripe from "stripe";

import { LeanPaymentDocument, PaymentType } from "../models/Payment";

export type PaymentRouteTypes = {
  "/payment/": {
    POST: {
      body: PaymentType;

      response: string;
    };
    GET: {
      query: {
        page?: string;
        limit?: string;
        "sort-direction"?: string;
        "sort-field"?: string;
        keyword?: string;
      };
      response: IPaginatedResult<LeanPaymentDocument>;
    };
  };
  "/payment/:id": {
    PUT: {
      body: {
        authId: string;
        orderId: string;
        amount: number;
        currency: string;
        status: string;
        provider: {
          name: string;
          reference: string;
          meta: string;
        };
      };

      response: string;
      params: {
        id: string;
      };
    };
    DELETE: {
      response: string;
      params: {
        id: string;
      };
    };
    GET: {
      response: LeanDocument<
        PaymentType & {
          _id: Types.ObjectId;
        }
      >;
      params: {
        id: string;
      };
    };
  };
  "/payment/create-checkout-session": {
    POST: {
      body: {
        orderId: string;
        lineItems: Array<{
          productName: string;
          price: number;
          quantity: number;
        }>;
      };

      response: { clientSecret: string; paymentId: string };
    };
  };
  "/payment/webhook": {
    POST: {
      body: Stripe.EventBase;

      response: string;
    };
  };
  "/payment/create-payment-intent": {
    POST: {
      body: {
        orderAmount: number;
        orderId: string;
      };

      response: {
        clientSecret: string;
        paymentId: string;
      };
    };
  };
  "/payment/cancel-payment-intent": {
    POST: {
      body: {
        paymentIntentId: string;
      };

      response: string;
    };
  };
};
