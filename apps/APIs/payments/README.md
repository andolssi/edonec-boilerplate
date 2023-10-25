# Payments Microservice

## Table of content

- [Payments Microservice](#payments-microservice)
  - [Table of content](#table-of-content)
  - [Description](#description)
  - [Environement Variables](#environement-variables)
    - [Stripe related Variables](#stripe-related-variables)
  - [Payment model Schemas](#payment-model-schemas)
    - [Payment Model](#payment-model)
  - [Types](#types)
    - [Payment Model Type](#payment-model-type)
    - [Payment Provider Enum](#payment-provider-enum)
    - [Payment Status](#payment-status)
  - [Events](#events)
    - [Event list](#event-list)
    - [Payloads](#payloads)
  - [Stripe process](#stripe-process)

## Description

The **Payments** Microservice, centered around the '**Payment**' model, enables efficient management and moderation of payments within your application. It provides functionalities to create, update, and delete payments, create Stripe checkout sessions, and set up webhook listeners related to Stripe.<br>The microservice is equipped to handle both offline payments and Stripe payment processing. Additionally, it can be extended to accommodate additional payment providers to meet the requirements of future projects.

## Environement Variables

The comments microservice requires a few environement variables in order to function:

- PORT
- MICROSERVICE_NAME

### Stripe related Variables

- STRIPE_SECRET_KEY
- ENDPOINT_SECRET
- TERMS_OF_SERVICE_LINK

> **ENDPOINT_SECRET:** > **(Stripe)**  
> Your Webhook Signing Secret for this endpoint (e.g., 'whsec\_...').
> You can get this [in your stripe dashboard](https://dashboard.stripe.com/webhooks).

---

> **TERMS_OF_SERVICE_LINK:** > **Collect a terms of service agreement (Stripe)**  
> Businesses often require their customers to agree to their terms of service before they can pay. This might depend on the type of product or subscription. Checkout helps you collect the necessary agreement by requiring a customer to accept your terms before paying.

- [Stripe Doc link](https://stripe.com/docs/payments/checkout/customization#collect-a-terms-of-service-agreement) collect-a-terms-of-service-agreement

<img src="https://b.stripecdn.com/docs-statics-srv/assets/terms-of-service-consent-collection.bb385b6f6a3cb40ac25f61b2823175ae.png" alt="stripe-terms-of-service-consent-collection" width="400"/>

## Payment model Schemas

```typescript
const schema = new Schema<PaymentType, PaymentModel>(
  {
    authID: { type: String, required: true },
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: {
      type: String,
      enum: PaymentStatus,
      required: true,
      default: PaymentStatus.PENDING,
    },
    provider: {
      name: { type: String, enum: PaymentProviderEnum, required: true },
      reference: { type: String, required: true },
      meta: { type: Object, required: false },
    },
  },
  { timestamps: true }
);
```

### Payment Model

| Field Name  | Type              | description                                                                         | Required? |
| ----------- | ----------------- | ----------------------------------------------------------------------------------- | --------- |
| authID      | string            | Unique identifier for the authorized user initiating the payment.                   | true      |
| orderId     | string            | Unique identifier for the order associated with the payment.                        | true      |
| amount      | number            | The monetary amount of the payment.                                                 | true      |
| currency    | string            | The currency in which the payment is made (e.g., USD, EUR).                         | true      |
| status      | string            | The current status of the payment as [Payment Status Enum](#payment-status)         | true      |
| provider\*  | object            | Information about the payment provider used, consisting of the following subfields: | true      |
| - name      | string            | The name of the payment provider (e.g., Stripe, PayPal).                            | true      |
| - reference | string            | A unique identifier associated with the payment provider.                           | true      |
| - meta      | object (optional) | Additional metadata related to the payment associated with the payment provider     | false     |

- The '**provider**' field within the Payment Model is vital for specifying the [**payment provider**](#payment-provider-enum) and its details.
  - Depending on the provider, additional information might be required.

## Types

### Payment Model Type

```typescript
export type PaymentType = {
  authID: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: {
    name: PaymentProviderEnum;
    reference: string;
    meta?: Stripe.Response<Stripe.Checkout.Session>;
  };
};
```

### Payment Provider Enum

```typescript
export enum PaymentProviderEnum {
  NONE = "NONE",
  STRIPE = "STRIPE",
  PAYPAL = "PAYPAL",
  KONNECT = "KONNECT",
  PAYMEE = "PAYMEE",
  OTHER = "OTHER",
}
```

### Payment Status

```typescript
export enum PaymentStatus {
  INITIATED = "INITIATED",
  PENDING = "PENDING",
  FAILED = "FAILED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
  REFUNDED = "REFUNDED",
  EXPIRED = "EXPIRED",
}
```

## Events

Event names and event payloads are defined in the `payments-types` package in [file payments-types/events/index.ts](../../../packages/node/api-types/payments-types/events/index.ts).

### Event list

```typescript
export enum PaymentsEvents {
  PaymentsError = "PaymentsError",
  PaymentCreated = "PaymentCreated",
  PaymentFetched = "PaymentFetched",
  AllPaymentsFetched = "AllPaymentsFetched",
  PaymentUpdated = "PaymentUpdated",
  PaymentDeleted = "PaymentDeleted",
  StripePaymentCreated = "StripePaymentCreated",
  StripePaymentUpdated = "StripePaymentUpdated",
  UserStripeCustomerCreated = "UserStripeCustomerCreated",
}
```

### Payloads

**1 - PaymentsError:**

**Payload:** TCustomErrors<br>
**Scenario:** This event is intended to be triggered when an error occurs in the Payments Microservice.<br>
**Payload Type:** [**TCustomErrors**](../../../packages/node/shared-types/Errors.ts)
Link to Error Types

```typescript
type TCustomErrors =
  | IObjectValidationError
  | TUnknownError
  | IUnauthorizedError
  | INotFoundError;
```

**2 - PaymentCreated:**

**Payload:** { payment: PaymentType }<br>
**Scenario:** This event is triggered when a new payment is successfully created. The payload includes the details of the created payment.<br>
**End-point:** **POST** payments/payment/

**3 - PaymentUpdated:**

**Payload:** { payment: [`PaymentType`](#payment-model-type) }<br>
**Scenario:** This event is triggered when an existing payment is successfully updated. The payload includes the updated payment document.<br>
**End-point:** **PUT** payments/payment/:id

**4 - PaymentDeleted:**

**Payload:** { paymenId: string, isPaymentDeleted: boolean }<br>
**Scenario:** This event is triggered when a payment is deleted. The payload includes the ID of the deleted payment and a flag indicating if the payment was successfully deleted.<br>
**End-point:** DELETE payments/payment/:id

**5 - PaymentFetched:**

**Payload:** { payment: [`PaymentType`](#payment-model-type) }<br>
**Scenario:** This event is triggered when payment details are successfully fetched. The payload includes the payment details.<br>
**End-point:** **GET** payments/payment/:id

**6 - AllPaymentsFetched:**

**Payload:** { paginatedPayment: IPaginatedResult<[`PaymentType`](#payment-model-type)> }<br>
**Scenario:** This event is triggered when all payments are successfully fetched, typically with pagination. The payload includes a paginated list of payment details.<br>
**End-point:** **GET** payments/payment/

**7 - UserStripeCustomerCreated:**

**Payload:** { authID: string, stripeId: string }
**Scenario:** This event is triggered when a Stripe customer is successfully created for a user. The payload includes the user's ID and the Stripe customer ID.<br>
**End-point:** **POST** payments/payment/create-checkout-session

**8 - StripePaymentCreated:**

**Payload:** { payment: [`PaymentType`](#payment-model-type) }<br>
**Scenario:** This event is triggered when a Stripe payment is successfully created. The payload includes the payment details.<br>
**End-point:** **POST** payments/payment/create-checkout-session

**9 - StripePaymentUpdated:**

**Payload:** { eventName: Stripe.Event.Type, payment: [`PaymentType`](#payment-model-type) }<br>
**Scenario:** This event is triggered when a Stripe payment is successfully updated from Stripe notification events. The payload includes the Stripe event name and the payment details.<br>
**End-point:** **POST** payments/payment/webhook

## Stripe process

Explore a full, working code sample of an integration with **Stripe Checkout**. The client and server-side code embeds a prebuilt payment page on your website. Before you get started, confirm the payment methods you want to offer in your payment method settings.<br>
[stripe doc description](https://stripe.com/docs/checkout/embedded/quickstart?client=react)

Add Stripe to your React app :

```typescript
import React, { useState, useEffect } from "react";
import Api from "api";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import "./App.css";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
// This is your test public API key.
const stripePromise = loadStripe(
  "pk_test_51LDrziDYlUJcolVEEj5CM85Bhe4FqEQYsezSvUDeHugx3V9BxOUFv1I1c8MclfJNGgfRSKFvMn4NqT5QX6e8I3lc00a36uUrrK"
);

const CheckoutForm = () => {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create a Checkout Session as soon as the page loads
    await Api.paymentSDK
      .addCreateCheckoutSession({
        body: ****{
          orderId: "Order_ID_example",
          lineItems: [
            {
              productName: "product name 01",
              price: 10500,
              quantity: 3,
            },
            {
              productName: "product name 02",
              price: 3500,
              quantity: 2,
            },
          ],
        },
      })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  return (
    <div id="checkout">
      {clientSecret && (
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      )}
    </div>
  );
};

const Return = () => {
  const [status, setStatus] = useState(null);
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId = urlParams.get("session_id");

// get user email ...
    await authSDK.getAuthByAccessToken().then((res) => res.json())
      .then((data) => {
        setCustomerEmail(data.email);
      });;
// we need to get this payment ...
    await Api.paymentSdk.getPayment({params: {
      paymentId
    }}).then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
      });
  }, []);

  if (status === "open") {
    return <Navigate to="/checkout" />;
  }

  if (status === "complete") {
    return (
      <section id="success">
        <p>
          We appreciate your business! A confirmation email will be sent to{" "}
          {customerEmail}. If you have any questions, please email
          <a href="mailto:orders@example.com">orders@example.com</a>.
        </p>
      </section>
    );
  }

  return null;
};

const App = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/checkout" element={<CheckoutForm />} />
          <Route path="/return" element={<Return />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
```
