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
import * as multerConfig from "./multerConfig";

let curTime: any;
let curDay: any;
Settings.defaultZone = "utc+7";

const app = express();

// parse a json request
app.use(bodyParser.json());

// get an Image form the file
app.use(
  multer({
    storage: multerConfig.docFileStorage,
    fileFilter: multerConfig.docFileFilter,
  }).single("image")
);

// Cross Origins Handler
app.use(cors());

// Find Endpoint
app.use("/images", express.static("./images"));
app.use("/expenses", expensesRoutes);
app.use("/auth", authRoutes);
app.use("/system13", systemRoutes);
app.use("/timetables", timetablesRoutes);
// app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Can't find Endpoint
app.use("/", errorController.notFound404);

// Central Error Handler
app.use(errorController.centralError);

let io;

// Get port form the .env file if not found use default
const port = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGOOSE_URI!)
  .then((result) => {
    console.log("Connected to the database.");
    const server = app.listen(port);
    console.log(`Started listening at port (${port})`);
    // @ts-ignore
    io = socket.init(server);
    console.log("Socket.IO has been Initialized.");
    io.on("connection", (socket: any) => {
      console.log(`Client connected | ID ${socket.id}`);
      socket.emit(
        "welcome",
        "You have been connected to SS-APIs websocket Network."
      );

      socket.on("how", (msg: string) => {
        console.log(msg);

        socket.emit("msg", "Message have reached the server.");
      });
    });
  })
  .catch((err) => console.log(err));

const db = mongoose.connection;
export const sio = io;
