const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const systemRoutes = require("./routes/system");
const errorController = require("./controllers/errors");
const authRoutes = require("./routes/auth");

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/system13", systemRoutes);

// app.use("/", errorController.statusMaintenance);

app.use((error, req, res, next) => {
  console.log("an error has occurred");
  res.status(500).json({
    message: "This error has been send from the central error handler",
    error,
  });
});

mongoose
  .connect(
    "mongodb+srv://api:rQJ2H3ze3VTfwlef@cluster0.ncvvz.mongodb.net/system13?retryWrites=true&w=majority"
  )
  .then((result) => {
    console.log("Connected to the database");
    app.listen(3000);
  });
