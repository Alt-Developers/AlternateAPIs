import env from "dotenv";
import express, { ErrorRequestHandler, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose, { AnyArray } from "mongoose";
import multer from "multer";
import socketIO from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { DateTime, Settings } from "luxon";

env.config({ path: "./.env" });

import * as errorController from "./controllers/errors";
import systemRoutes from "./routes/system";
import authRoutes from "./routes/auth";
import expensesRoutes from "./routes/expenses";
import timetablesRoutes from "./routes/timetables";
import socket from "./socket";

let curTime: any;
let curDay: any;
Settings.defaultZone = "utc+7";
const fileStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const sanitizedOriginalName = file.originalname.replace(/ /g, "_");
    const dateAdded = DateTime.local();
    cb(
      null,
      `${dateAdded.day}${
        dateAdded.month < 10 ? "0" + dateAdded.month : dateAdded.month
      }${dateAdded.year}-${uuidv4()}.${
        file.mimetype.endsWith("png")
          ? ".png"
          : file.mimetype.endsWith("jpg")
          ? ".jpg"
          : ".jpeg"
      }`
    );
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
      console.log(`Client connected | ID ${socket.id}`);
      socket.emit(
        "welcome",
        "You have been connected to SS-APIs websocket Network."
      );
    });
  })
  .catch((err) => console.log(err));

const db = mongoose.connection;
export const sio = io;
