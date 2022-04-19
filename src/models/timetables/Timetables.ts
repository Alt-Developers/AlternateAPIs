import { Schema, Types, connection, model } from "mongoose";
import { TimetableInterface } from "../types/modelType";

const timetableSchema = new Schema(
  {
    classNo: {
      required: true,
      type: String,
    },
    year: {
      required: true,
      type: String,
    },
    color: {
      required: true,
      type: String,
    },
    school: {
      type: String,
      required: true,
    },
    program: {
      required: true,
      type: String,
      minlength: 5,
      maxlength: 5,
    },
    timetableContent: {
      monday: [
        {
          type: String,
          required: true,
          minlength: 3,
          maxlength: 3,
        },
      ],
      tuesday: [
        {
          type: String,
          required: true,
          minlength: 3,
          maxlength: 3,
        },
      ],
      wednesday: [
        {
          type: String,
          required: true,
          minlength: 3,
          maxlength: 3,
        },
      ],
      thursday: [
        {
          type: String,
          required: true,
          minlength: 3,
          maxlength: 3,
        },
      ],
      friday: [
        {
          type: String,
          required: true,
          minlength: 3,
          maxlength: 3,
        },
      ],
    },
    createdBy: {
      type: Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

const db = connection.useDb("timetables");

export default db.model<TimetableInterface>("Timetable", timetableSchema);
