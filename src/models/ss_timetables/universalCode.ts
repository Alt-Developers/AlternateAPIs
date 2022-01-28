import { Schema, Types, connection, model } from "mongoose";
import { UniversalCodeInterface } from "../types";
const UniversalCodeSchema = new Schema(
  {
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

const db = connection.useDb("ss_timetables");
export default db.model<UniversalCodeInterface>(
  "UniversalCode",
  UniversalCodeSchema
);
