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
          subjectName: {
            type: String,
            required: true,
          },
          subjectCode: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 3,
          },
        },
      ],
      tuesday: [
        {
          subjectName: {
            type: String,
            required: true,
          },
          subjectCode: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 3,
          },
        },
      ],
      wednesday: [
        {
          subjectName: {
            type: String,
            required: true,
          },
          subjectCode: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 3,
          },
        },
      ],
      thursday: [
        {
          subjectName: {
            type: String,
            required: true,
          },
          subjectCode: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 3,
          },
        },
      ],
      friday: [
        {
          subjectName: {
            type: String,
            required: true,
          },
          subjectCode: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 3,
          },
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
