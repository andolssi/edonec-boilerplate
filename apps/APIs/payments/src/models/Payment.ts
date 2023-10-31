import { model, Schema } from "mongoose";
import {
  PaymentModel,
  PaymentProviderEnum,
  PaymentStatus,
  PaymentType,
  PaymentTypeSaticMethods,
} from "payments-types/models/Payment";
import { IPaginatedResult } from "shared-types";

import { getPaginationAggregation } from "helpers/getPaginationAggregation";

const schema = new Schema<PaymentType, PaymentModel>(
  {
    authId: { type: String, required: true },
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: {
      type: String,
      enum: PaymentStatus,
      default: PaymentStatus.INITIATED,
      required: true,
    },
    paymentHistory: [
      {
        status: {
          type: String,
          enum: PaymentStatus,
          default: PaymentStatus.INITIATED,
          required: true,
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    provider: {
      name: { type: String, enum: PaymentProviderEnum, required: true },
      reference: { type: String, required: true },
      meta: { type: Object, required: false },
    },
  },
  { timestamps: true }
);

const findPaginatedPayment: PaymentTypeSaticMethods["findPaginated"] =
  async function findPaginatedPayments(this, args, prependedPipelines = []) {
    const [paginatedResults] = await this.aggregate<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      IPaginatedResult<any>
    >([...prependedPipelines, ...getPaginationAggregation(args)]);

    return paginatedResults;
  };

schema.static("findPaginated", findPaginatedPayment);

export default model<PaymentType, PaymentModel>("Payment", schema);
