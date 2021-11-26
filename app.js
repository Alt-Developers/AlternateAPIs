const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const routes = require("./routes/index-route");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(routes);

mongoose
  .connect(
    "mongodb+srv://api:rQJ2H3ze3VTfwlef@cluster0.ncvvz.mongodb.net/system13?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(3000);
  });
