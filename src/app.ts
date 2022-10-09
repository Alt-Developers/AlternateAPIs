import env from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { centralError } from "./controllers/errors";

import authRouter from "./routers/auth";

declare global {
  namespace Express {
    interface Request {
      [key: string]: any;
    }
  }
  interface Error {
    statusCode: number;
    type?: string;
    header?: string;
    location?: string;
    modal?: boolean;
  }
}

env.config({ path: ".env" });

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);

app.use(centralError);

console.log(process.env.PORT);
if (process.env.mongoose) {
  mongoose.connect(process.env.mongoose).then((data) => {
    console.log("Connected to the database");
    app.listen(process.env.PORT ?? 8000);
    console.log("started listening at port:", process.env.PORT);
  });
}
