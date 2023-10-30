import React, { useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import AuthSDK, { AuthSDKTypes } from "auth-sdk";
import { Button } from "core-ui";
import { Input } from "forms";
import PaymentsSDK from "payments-sdk";
import ApiSDK from "server-sdk";

const stripePromise = loadStripe(
  "pk_test_51LDrziDYlUJcolVEEj5CM85Bhe4FqEQYsezSvUDeHugx3V9BxOUFv1I1c8MclfJNGgfRSKFvMn4NqT5QX6e8I3lc00a36uUrrK"
);

const api = new ApiSDK();
const paymentsSDK = new PaymentsSDK(api);
const authSDK = new AuthSDK(api);

const EmbeddedPayment = () => {
  const { t } = useTranslation();

  const [clientSecret, setClientSecret] = useState("");

  const signInFormMethods = useForm<AuthSDKTypes["SignInClassicBodyType"]>();

  const onSubmitSignIn: SubmitHandler<
    AuthSDKTypes["SignInClassicBodyType"]
  > = async (body) => {
    await authSDK.signInClassic({ body });
    // Create a Checkout Session as soon as the page loads
    paymentsSDK
      .addCreateCheckoutSession({
        body: {
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
      .then((data) => {
        setClientSecret(data.clientSecret);
      });
  };

  return (
    <>
      <div className="m-6 flex justify-center">
        <FormProvider {...signInFormMethods}>
          <form onSubmit={signInFormMethods.handleSubmit(onSubmitSignIn)}>
            <h6>{t("signin")}</h6>
            <Input name="email" type="email" placeholder="email" />
            <Input name="password" type="password" placeholder="password" />
            <Button primary type="submit">
              Submit
            </Button>
          </form>
        </FormProvider>
      </div>
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
    </>
  );
};

export default EmbeddedPayment;
