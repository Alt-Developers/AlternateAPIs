import { Schema, model, connection } from "mongoose";
import { PlayerInterface } from "../types/modelType";

const playerSchema: Schema = new Schema(
  {
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
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);
const system13Db = connection.useDb("system13");

export default system13Db.model<PlayerInterface>("Player", playerSchema);
