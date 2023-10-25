import { useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import AuthSDK, { AuthSDKTypes } from "auth-sdk";
import { ButtonLink, SEO, UnstyledLink } from "core-next-components";
import Button from "core-ui/Button";
import { Input } from "forms";
import PaymentsSDK from "payments-sdk";
import ApiSDK from "server-sdk";

const stripePromise = loadStripe(
  "pk_test_51LDrziDYlUJcolVEEj5CM85Bhe4FqEQYsezSvUDeHugx3V9BxOUFv1I1c8MclfJNGgfRSKFvMn4NqT5QX6e8I3lc00a36uUrrK"
);

// !STARTERCONF -> Select !STARTERCONF and CMD + SHIFT + F
// Before you begin editing, follow all comments with `STARTERCONF`,
// to customize the default configuration.
import { useRouter } from "next/router";

const api = new ApiSDK();
const authSDK = new AuthSDK(api);
const paymentsSDK = new PaymentsSDK(api);

export default function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();

  const changeLanguage = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale });
  };

  const signUpFormMethods = useForm<AuthSDKTypes["SignUpClassicBodyType"]>();
  const signInFormMethods = useForm<AuthSDKTypes["SignInClassicBodyType"]>();

  const onSubmitSignUp: SubmitHandler<AuthSDKTypes["SignUpClassicBodyType"]> = (
    body
  ) => {
    authSDK.signUpClassic({ body });
  };
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

  const [clientSecret, setClientSecret] = useState("");

  return (
    <>
      <SEO />
      <main>
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
        <section className=" bg-primary-50 ">
          <div
            className="
          layout flex min-h-screen flex-col items-center justify-center bg-white text-center"
          >
            <div className="flex gap-2">
              <Button primary onClick={() => changeLanguage("fr")}>
                Fr
              </Button>
              <Button primary onClick={() => changeLanguage("en")}>
                En
              </Button>
            </div>
            <div>
              Process.env variable
              <strong>{process.env.NEXT_PUBLIC_HELLO || "Hello"}</strong>
            </div>
            <div className="flex gap-5">
              <FormProvider {...signUpFormMethods}>
                <form onSubmit={signUpFormMethods.handleSubmit(onSubmitSignUp)}>
                  <h6>Sign up form</h6>
                  <Input name="email" type="email" placeholder="email" />
                  <Input name="userName" type="text" placeholder="userName" />
                  <Input
                    name="password"
                    type="password"
                    placeholder="password"
                  />
                  <Button primary type="submit">
                    Submit
                  </Button>
                </form>
              </FormProvider>
              <FormProvider {...signInFormMethods}>
                <form onSubmit={signInFormMethods.handleSubmit(onSubmitSignIn)}>
                  <h6>{t("signin")}</h6>
                  <Input name="email" type="email" placeholder="email" />
                  <Input
                    name="password"
                    type="password"
                    placeholder="password"
                  />
                  <Button primary type="submit">
                    Submit
                  </Button>
                </form>
              </FormProvider>
            </div>
            <Button info type="button" onClick={() => authSDK.logout()}>
              logout
            </Button>

            <h1 className="mt-4">Next.js + Tailwind CSS + TypeScript</h1>
            <p className="mt-2 text-sm text-gray-800">
              A starter for Next.js, Tailwind CSS, and TypeScript with Absolute
              Import, Seo, Link component, pre-configured with Husky{" "}
            </p>
            <p className="mt-2 text-sm text-gray-700">
              <ButtonLink href="/dashboard">Go to dashboard</ButtonLink>
            </p>
            <p className="mt-2 text-sm text-gray-700">
              <ButtonLink href="/api/v1">Go to API</ButtonLink>
            </p>

            <ButtonLink className="mt-6" href="/components" light>
              See all components
            </ButtonLink>

            <footer className="absolute bottom-2 text-gray-700">
              © {new Date().getFullYear()} By{" "}
              <UnstyledLink href="https://edonec.com">eDonec</UnstyledLink>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}
