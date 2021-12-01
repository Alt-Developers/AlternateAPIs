const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const playerSchema = new Schema({
  realName: {
    type: String,
    required: true,
  },
  codeName: {
    type: String,
    minlength: 3,
    maxlength: 3,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Player", playerSchema);
