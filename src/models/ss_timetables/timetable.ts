import { Schema, Types, connection, model } from "mongoose";
import { TimetableInterface } from "../types";

const timetableSchema = new Schema(
  {
    classNo: {
      required: true,
      type: String,
    },
    defaultColor: {
      required: true,
      type: String,
    },
    classId: {
      type: Types.ObjectId,
      required: true,
    },
    program: {
      required: true,
      type: String,
      minlength: 4,
      maxlength: 4,
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
    updated: {
      updatedBy: {
        type: Types.ObjectId,
      },
      updatedAt: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

const db = connection.useDb("ss_timetables");

export default db.model<TimetableInterface>("Timetable", timetableSchema);
