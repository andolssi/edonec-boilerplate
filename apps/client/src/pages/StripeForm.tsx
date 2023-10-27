import React, { FormEvent, useEffect, useState } from "react";

import {
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Layout, LayoutObject } from "@stripe/stripe-js";

function StripeForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    console.log(clientSecret);

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) throw new Error("paymentIntent ");

      switch (paymentIntent.status) {
        case "succeeded": {
          console.log("Payment succeeded!");
          setMessage("Payment succeeded!");
          break;
        }
        case "processing": {
          console.log("Your payment is processing.");
          setMessage("Your payment is processing.");
          break;
        }
        case "requires_payment_method": {
          console.log("Your payment was not successful, please try again.");
          setMessage("Your payment was not successful, please try again.");
          break;
        }
        default: {
          console.log("Something went wrong.");
          setMessage("Something went wrong.");
          break;
        }
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: FormEvent<HTMLInputElement>) => {
    e.preventDefault();

    console.log({ handleSubmitEvent: e });

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      console.log("Stripe.js hasn't yet loaded");

      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: "http://localhost:3000",
        receipt_email: email,
      },
    });

    console.log({ paymentError: error });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || null);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  const paymentElementOptions: { layout: Layout | LayoutObject } = {
    layout: "tabs",
  };

  return (
    <form
      id="payment-form"
      onSubmit={
        handleSubmit as unknown as
          | React.FormEventHandler<HTMLFormElement>
          | undefined
      }
      style={{
        width: "30vw",
        minWidth: "500px",
        alignSelf: "center",
        boxShadow:
          "0px 0px 0px 0.5px rgba(50, 50, 93, 0.1), 0px 2px 5px 0px rgba(50, 50, 93, 0.1), 0px 1px 1.5px 0px rgba(0, 0, 0, 0.07)",
        borderRadius: "7px",
        padding: "40px",
      }}
    >
      <LinkAuthenticationElement
        id="link-authentication-element"
        onChange={(e) => {
          console.log({ e });
          setEmail(e.value.email);
        }}
      />
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        style={{
          background: "#5469d4",
          fontFamily: "Arial, sans-serif",
          color: "#ffffff",
          borderRadius: "4px",
          border: "0",
          padding: "12px 16px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
          display: "block",
          transition: "all 0.2s ease",
          boxShadow: "0px 4px 5.5px 0px rgba(0, 0, 0, 0.07)",
          width: "100%",
        }}
      >
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && (
        <div
          id="payment-message"
          style={{
            color: "rgb(105, 115, 134)",
            fontSize: "16px",
            lineHeight: "20px",
            paddingTop: "12px",
            textAlign: "center",
          }}
        >
          {message}
        </div>
      )}
    </form>
  );
}

export default StripeForm;
