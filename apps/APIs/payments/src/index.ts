/* eslint-disable no-console */
import { connect, ConnectOptions } from "mongoose";
import "dotenv/config";

import app, { baseUrl } from "./init";
import router from "./routes";

const port = process.env.PORT || 4011;

const databaseConfig: ConnectOptions = {
  user: process.env.DATABASE_USER,
  pass: process.env.DATABASE_PASSWORD,
};

if (
  !process.env.DATABASE_URI ||
  !process.env.MICROSERVICE_NAME ||
  !process.env.STRIPE_SECRET_KEY ||
  !process.env.ENDPOINT_SECRET ||
  !process.env.TERMS_OF_SERVICE_LINK
)
  throw new Error(
    "Missing .env key : DATABASE_URI or MICROSERVICE_NAME or STRIPE_SECRET_KEY or ENDPOINT_SECRET or TERMS_OF_SERVICE_LINK"
  );

app.use(baseUrl, router);

connect(
  process.env.NODE_ENV === "production"
    ? `${process.env.DATABASE_URI}`
    : `${process.env.DATABASE_URI}/${process.env.MICROSERVICE_NAME}`,
  databaseConfig
)
  .then(() => {
    app.listen(port, () => {
      import("events/listeners");
      console.log(`🚀 Server listening at http://localhost:${port}`);
    });
  })
  .catch(console.error);
