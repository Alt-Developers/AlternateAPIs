import env from "dotenv";
import express, { ErrorRequestHandler, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose, { AnyArray } from "mongoose";
import multer from "multer";
import socketIO from "socket.io";

env.config({ path: "./.env" });

import * as errorController from "./controllers/errors";
import systemRoutes from "./routes/system";
import authRoutes from "./routes/auth";
import expensesRoutes from "./routes/expenses";
import timetablesRoutes from "./routes/timetables";
import socket from "./socket";

let curTime: any;
let curDay: any;

const fileStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const sanitizedOriginalName = file.originalname.replace(/ /g, "_");
    const dateAdded = new Date().toISOString();
    cb(null, `${dateAdded}-${sanitizedOriginalName}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const fileType: string = file.mimetype;
  if (fileType.startsWith("image")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const app = express();

// parse a json request
app.use(bodyParser.json());

// get an Image form the file
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

// Cross Origins Handler
app.use(cors());

// Find Endpoint
app.use("/images", express.static("./images"));
app.use("/expenses", expensesRoutes);
app.use("/auth", authRoutes);
app.use("/system13", systemRoutes);
app.use("/timetables", timetablesRoutes);

// Can't find Endpoint
app.use("/", errorController.notFound404);

// Central Error Handler
app.use(errorController.centralError);

let io;
mongoose
  .connect(process.env.MONGOOSE_URI!)
  .then((result) => {
    console.log("Connected to the database.");
    const server = app.listen(8080);
    // @ts-ignore
    io = socket.init(server);
    io.on("connection", (socket: any) => {
      console.log("Client connected");
      socket.emit(
        "welcome",
        "You have been connected to SS-APIs websocket Network."
      );
    });
  })
  .catch((err) => console.log(err));

const db = mongoose.connection;
export const sio = io;
