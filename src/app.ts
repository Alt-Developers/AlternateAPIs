import env from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { centralError } from "./controllers/errors";
import { UserInterface } from "./models/types/modelType";
import { Document } from "mongoose";
import path from "path";
import cors from "cors";
import * as multerConfig from "./multer";
import authRouter from "./routers/auth";
import multer from "multer";

declare global {
  namespace Express {
    interface Request {
      [key: string]: any;
      user: Document & UserInterface;
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

app.use(cors());

app.use(express.json());
app.use(
  multer({
    storage: multerConfig.docFileStorage,
    fileFilter: multerConfig.docFileFilter,
  }).single("image")
);

app.use("/images", express.static(path.join(__dirname, "..", "images")));
app.use("/auth", authRouter);

app.use(centralError);

console.info("Starting the server");
if (process.env.mongoose) {
  mongoose.connect(process.env.mongoose).then((data) => {
    console.log("Connected to the database");
    app.listen(process.env.PORT ?? 8000);
    console.log("started listening at port: " + process.env.PORT);
  });
}
