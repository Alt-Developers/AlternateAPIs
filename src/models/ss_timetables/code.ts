import { ObjectId } from "mongodb";
import { Schema, Types, connection, model } from "mongoose";
import { codeInterface } from "../types";

const codeSchema = new Schema({
  programCode: {
    type: String,
    minlength: 4,
    maxlength: 4,
    required: true,
  },
  programName: {
    type: String,
    required: true,
  },
  classCode: {
    EN: {
      type: Object,
    },
    TH: {
      type: Object,
    },
  },
});

const db = connection.useDb("ss_timetables");

export default db.model<codeInterface>("code", codeSchema);
