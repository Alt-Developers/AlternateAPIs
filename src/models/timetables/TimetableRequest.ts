import { Schema, Types, connection, model } from "mongoose";
import {
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
    status: { type: String, required: true },
    type: {
      type: String,
      required: true,
    },
    classInfo: {
      year: {
        type: String,
        required: true,
      },
      classNo: {
        type: String,
        required: true,
      },
      school: {
        type: String,
        required: true,
      },
      program: {
        type: String,
        required: true,
      },
    },

    timetableImagePath: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

const db = connection.useDb("timetables");

export default db.model<TimetableRequestInterface>(
  "TimetableRequest",
  TimetableRequestSchema
);
