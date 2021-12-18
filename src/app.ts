import env from "dotenv";
import express, { ErrorRequestHandler, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";

env.config({ path: "./.env" });

import * as errorController from "./controllers/errors";
import systemRoutes from "./routes/system";
import authRoutes from "./routes/auth";
import expensesRoutes from "./routes/expenses";
import { landing } from "./controllers/landing";

const fileStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const newName = file.originalname.replace(/ /g, "_");
    cb(null, new Date().toISOString() + "-" + newName);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const app = express();

app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(cors());

app.get("/", landing);

app.use("/images", express.static("./images"));
app.use("/expenses", expensesRoutes);
app.use("/auth", authRoutes);
app.use("/system13", systemRoutes);

app.use("/", errorController.notFound404);

app.use(errorController.centralError);

mongoose.connect(process.env.MONGOOSE_URI!);

const db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to the database");
  app.listen(80);
});
