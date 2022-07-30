import express from "express";
import * as timetablesRoutes from "./routes/timetablesRoutes";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/timetables", timetablesRoutes);

app.listen(3000);
