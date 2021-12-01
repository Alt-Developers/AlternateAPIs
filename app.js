const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const systemRoutes = require("./routes/system");

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

app.use("/system13", systemRoutes);

mongoose
  .connect(
    "mongodb+srv://api:rQJ2H3ze3VTfwlef@cluster0.ncvvz.mongodb.net/system13?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(8080);
  });
