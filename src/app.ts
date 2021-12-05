import express, { ErrorRequestHandler, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";

import { errorHandler500, notFound404 } from "./controllers/errors";

const app = express();

app.use(bodyParser.json());
app.use(cors());

// app.use("/system");

app.use("/", notFound404);

app.use(errorHandler500);

mongoose
  .connect(
    "mongodb+srv://api:rQJ2H3ze3VTfwlef@cluster0.ncvvz.mongodb.net/system13?retryWrites=true&w=majority"
  )
  .then((result) => {
    console.log("Connected to the database");
    app.listen(80);
  });
