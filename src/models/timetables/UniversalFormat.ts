import { Schema, Types, connection, model } from "mongoose";
import { TimetableInterface, UniversalCodeInterface } from "../types";

const timetableSchema = new Schema(
  {
    school: {
      type: String,
      required: true,
    },
    universalCodes: {
      EN: {
        type: Object,
      },
      TH: {
        type: Object,
      },
    },
  },
  { timestamps: true }
);

const db = connection.useDb("timetables");

export default db.model<UniversalCodeInterface>(
  "UniversalFormat",
  timetableSchema
);
