// import bodyParser from "body-parser";
import * as paymentController from "controllers/payment";
import { Router } from "init";
import { ACCESS_RESSOURCES, PRIVILEGE } from "shared-types";
import * as paymentValidators from "validators/sync/payment";

const router = Router();
const BASE_ROUTE = "/payment";

router.postProtected(ACCESS_RESSOURCES.PAYMENT, PRIVILEGE.WRITE)(
  `${BASE_ROUTE}/`,
  paymentValidators.addPayment,
  paymentController.addPayment
);

router.putProtected(ACCESS_RESSOURCES.PAYMENT, PRIVILEGE.WRITE)(
  `${BASE_ROUTE}/:id`,
  paymentValidators.updatePayment,
  paymentController.updatePayment
);

router.deleteProtected(ACCESS_RESSOURCES.PAYMENT, PRIVILEGE.DELETE)(
  `${BASE_ROUTE}/:id`,
  paymentValidators.deletePayment,
  paymentController.deletePayment
);

router.getProtected(ACCESS_RESSOURCES.PAYMENT, PRIVILEGE.READ)(
  `${BASE_ROUTE}/:id`,
  paymentValidators.getPayment,
  paymentController.getPayment
);

router.getProtected(ACCESS_RESSOURCES.PAYMENT, PRIVILEGE.READ)(
  `${BASE_ROUTE}/`,
  paymentValidators.getPayments,
  paymentController.getPayments
);

router.postProtected(ACCESS_RESSOURCES.PUBLIC, PRIVILEGE.READ)(
  `${BASE_ROUTE}/create-checkout-session`,
  paymentValidators.addCreateCheckoutSession,
  paymentController.addCreateCheckoutSession
);

router.post(`${BASE_ROUTE}/webhook`, paymentController.addWebhook);

router.postProtected(ACCESS_RESSOURCES.PUBLIC, PRIVILEGE.READ)(
  `${BASE_ROUTE}/create-payment-intent`,
  paymentValidators.createPaymentIntent,
  paymentController.createPaymentIntent
);

export default router;
