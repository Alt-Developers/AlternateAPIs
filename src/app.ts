import express, { ErrorRequestHandler, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose, { mongo } from "mongoose";

import { errorHandler500, notFound404 } from "./controllers/errors";
import systemRoutes from "./routes/system";
import authRoutes from "./routes/auth";

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/system13", systemRoutes);

app.use("/", notFound404);

app.use(errorHandler500);

mongoose.connect(
  "mongodb+srv://api:rQJ2H3ze3VTfwlef@cluster0.ncvvz.mongodb.net/"
);

const db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to the database");
  app.listen(80);
});

// .then((result) => {
//   console.log("Connected to the database");
// });
