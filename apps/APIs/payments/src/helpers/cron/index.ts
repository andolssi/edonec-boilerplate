import Payment from "models/Payment";
import { scheduleJob } from "node-schedule";
import { PaymentStatus } from "payments-types/models/Payment";
import { cancelPaymentIntent } from "services/payment";

scheduleJob("0 * * * * *", async () => {
  const expiredPayment = await Payment.find({
    status: { $not: { $regex: `${PaymentStatus.EXPIRED}` } },

    createdAt: { $lt: new Date(Date.now() - 1000 * 60 * 60 * 0.0833333) },
  });

  expiredPayment.forEach(async (payment) => {
    payment.paymentHistory.push({ status: PaymentStatus.EXPIRED, createdAt: new Date() });
    payment.status = PaymentStatus.EXPIRED;

    await payment.save()
    await cancelPaymentIntent(payment.provider.reference)
  });
});

