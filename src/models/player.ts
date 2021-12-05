import { Schema, model } from "mongoose";
import { Player } from "../models/types";

const playerSchema: Schema = new Schema({
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

export default model<Player>("Player", playerSchema);
