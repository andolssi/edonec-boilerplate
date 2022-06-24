/* eslint-disable no-console */
import { connect, ConnectOptions } from "mongoose";
import "dotenv/config";

import app, { baseUrl } from "./init";
import router from "./routes";

const port = process.env.PORT || 4000;

const databaseConfig: ConnectOptions = {
  user: process.env.DATABASE_USER,
  pass: process.env.DATABASE_PASSWORD,
};

if (!process.env.DATABASE_URI)
  throw new Error("Missing .env key : DATABASE_URI");

app.use(baseUrl, router);

connect(process.env.DATABASE_URI, databaseConfig)
  .then(() => {
    import("helpers/cron");
    app.listen(port, () => {
      console.log(`🚀 Server listening at http://localhost:${port}`);
    });
  })
  .catch(console.error);
