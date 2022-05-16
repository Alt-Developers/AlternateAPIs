import { Schema, Types, connection, model } from "mongoose";
import {
  TimeLayoutInterface,
  TimetableInterface,
  TimetableRequestInterface,
  UniversalCodeInterface,
} from "../types/modelType";

// classInfo: {
//   year: String;
//   classNo: String;
//   school: "ASSUMPTION" | "NEWTON" | "ESSENCE" | string;
// }
// timetableImagePath: string;
// uploadedBy: ObjectId;

const TimetableRequestSchema = new Schema(
  {
    school: {
      type: String,
      required: true,
    },
    program: {
      type: String,
      required: true,
    },
    time: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);

const db = connection.useDb("timetables");

export default db.model<TimeLayoutInterface>(
  "TimetableRequest",
  TimetableRequestSchema
);
