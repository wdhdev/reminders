import mongoose from "mongoose";
import * as Sentry from "@sentry/node";

require("dotenv").config();

export default async () => {
    return mongoose
        .connect(process.env.MONGO_URI, {
            dbName: process.env.DEVELOPMENT ? "reminders-dev" : "reminders-prod"
        })
        .then(() => {
            console.log("Connected to Database!");
        })
        .catch((err: Error) => {
            Sentry.captureException(err);
            console.error(err);

            process.exit(1);
        });
};
