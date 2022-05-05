import { Schema, Types, connection, model } from "mongoose";
import { HolidayInterface, TimetableInterface } from "../types/modelType";
import User from "../authentication/user";

// type: "specific" | "public";
// school: "ALL" | "ASSUMPTION" | "NEWTON" | "ESSENCE" | string;
// name: string;
// date: Date;
// addedBy: ObjectId;

const HolidaySchema = new Schema(
  {
    type: { type: String, required: true },
    school: { type: String, required: true },
    name: {
      EN: { type: String, required: true },
      TH: { type: String, required: true },
    },
    desc: {
      EN: { type: String, required: true },
      TH: { type: String, required: true },
    },
    date: { type: String, required: true },
    addedBy: { type: Types.ObjectId, required: true, ref: User },
  },
  { timestamps: true }
);

const db = connection.useDb("timetables");

export default db.model<HolidayInterface>("Holiday", HolidaySchema);
