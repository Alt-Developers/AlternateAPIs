import { ObjectId } from "mongodb";
import { Schema, Types, connection, model } from "mongoose";
import { ClassesInterface } from "../types";

const classSchema = new Schema(
  {
    classNo: {
      required: true,
      type: String,
    },
    program: {
      required: true,
      type: String,
      minlength: 4,
      maxlength: 4,
    },
    timetable: {
      type: Types.ObjectId,
      required: false,
    },
    defaultColor: {
      type: String,
      required: true,
    },
    primaryClassOf: [Types.ObjectId],
  },
  { timestamps: true }
);

const db = connection.useDb("ss_timetables");

export default db.model<ClassesInterface>("userClass", classSchema);
