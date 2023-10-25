// eslint-disable-next-line simple-import-sort/imports
import "dotenv/config";
import { json } from "body-parser";
import producer from "events/producer";
import Server from "http-server";

const server = new Server(producer.emit.PaymentsError);

export const { Router, baseUrl } = server;

server.use(json());

if (
  !process.env.DATABASE_URI ||
  !process.env.MICROSERVICE_NAME ||
  !process.env.STRIPE_SECRET_KEY ||
  !process.env.ENDPOINT_SECRET ||
  !process.env.TERMS_OF_SERVICE_LINK
)
  throw new Error(
    "Missing .env key :  DATABASE_URI or MICROSERVICE_NAME or STRIPE_SECRET_KEY or ENDPOINT_SECRET or TERMS_OF_SERVICE_LINK"
  );

export default server.app;
