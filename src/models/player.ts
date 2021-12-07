import { Schema, model, connection } from "mongoose";
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
const system13Db = connection.useDb("system13");

export default system13Db.model<Player>("Player", playerSchema);
