import env from "dotenv";
import express, { ErrorRequestHandler, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";

env.config({ path: "./.env" });

import * as errorController from "./controllers/errors";
import systemRoutes from "./routes/system";
import authRoutes from "./routes/auth";

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/system13", systemRoutes);

app.use("/", errorController.notFound404);

app.use(errorController.errorHandler500);

mongoose.connect(process.env.MONGOOSE_URI!);

const db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to the database");
  app.listen(80);
});
