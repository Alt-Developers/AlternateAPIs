import { RequestHandler } from "express";
import { DateTime, NumberUnitLength, Settings } from "luxon";
import User from "../models/authentication/user";
import Format from "../models/timetables/Format";
import Timetables from "../models/timetables/Timetables";
import { TimetableContentInterface } from "../models/types";
import newError from "../utilities/newError";
import validationErrCheck from "../utilities/validationErrChecker";

let curTime: number;
let curDay: string;
let curWeekDay: number;
Settings.defaultZone = "utc+7";

export default setInterval(() => {
  const now = DateTime.local();
  const day = now.weekday;
  const advanceTime = +`${now.hour}${
    (now.minute < 10 ? "0" : "") + now.minute
  }${(now.second < 10 ? "0" : "") + now.second}`;
  curTime = +`${now.hour}${(now.minute < 10 ? "0" : "") + now.minute}`;
  curWeekDay = day;
  if (day === 1) curDay = "monday";
  if (day === 2) curDay = "tuesday";
  if (day === 3) curDay = "wednesday";
  if (day === 4) curDay = "thursday";
  if (day === 5) curDay = "friday";

  if (day === 7 || day === 6) curDay = "weekend";

  //   if (
  //     advanceTime === 83000 ||
  //     advanceTime === 92000 ||
  //     advanceTime === 110000 ||
  //     advanceTime === 114000 ||
  //     advanceTime === 124000 ||
  //     advanceTime === 133000 ||
  //     advanceTime === 142000 ||
  //     advanceTime === 150000
  //   ) {
  //     socket.getIO().emit("glance", {
  //       action: "refresh",
  //       currentTime: curTime,
  //     });
  //   }

  // console.log(curDay, curWeekDay, advanceTime);
}, 1000);

export const newTimetable: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user)
      return newError(
        404,
        "Critical Error Has Occured|Please contect system administrator immediately.",
        "important"
      );

    const school = req.body.school;
    const timetableContent: TimetableContentInterface = req.body.content;
    const program = req.body.program;
    const classNo = req.body.classNo;
    const color = req.body.color;

    if (!timetableContent.monday) newError(400, "monday must be filled");
    if (!timetableContent.tuesday) newError(400, "tuesday must be filled");
    if (!timetableContent.wednesday) newError(400, "wednesday must be filled");
    if (!timetableContent.thursday) newError(400, "thursday must be filled");
    if (!timetableContent.friday) newError(400, "friday must be filled");

    console.log({ school, timetableContent, program, classNo, color });

    const allCode = await Format.find();
    console.log({ allCode });

    const code = await Format.findOne({ programCode: program });
    if (!code) return newError(404, "Program not found.");
    const subjectCode = Object.keys(code.classCode.EN);

    timetableContent.monday.forEach((cur) => {
      if (!subjectCode.includes(cur))
        newError(400, `Wrong subject Code|[MONDAY][${cur}]`, "validation");
    });

    timetableContent.tuesday.forEach((cur) => {
      if (!subjectCode.includes(cur))
        newError(400, `Wrong subject Code|[TUESDAY][${cur}]`, "validation");
    });

    timetableContent.wednesday.forEach((cur) => {
      if (!subjectCode.includes(cur))
        newError(400, `Wrong subject Code|[WEDNESDAY][${cur}]`, "validation");
    });

    timetableContent.thursday.forEach((cur) => {
      if (!subjectCode.includes(cur))
        newError(400, `Wrong subject Code|[THURSDAY][${cur}]`, "validation");
    });

    timetableContent.friday.forEach((cur) => {
      if (!subjectCode.includes(cur))
        newError(400, `Wrong subject Code|[FRIDAY][${cur}]`, "validation");
    });

    // export interface TimetableInterface extends Document {
    //   classNo: string;
    //   program: string;
    //   school: string;
    //   color: string;
    //   timetableContent: TimetableContentInterface;
    //   createdBy: ObjectId;
    //   createdAt: Date;
    //   updatedAt: Date;
    // }

    const newTimetable = new Timetables({
      classNo: classNo,
      program: program,
      school: school,
      color: color,
      timetableContent: timetableContent,
      createdBy: user._id,
    });

    const savedTimetable = await newTimetable.save();

    res.status(200).json({
      savedTimetable,
    });
  } catch (error) {
    next(error);
  }
};

export const newFormat: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const programCode = req.body.programCode;
    const programName = req.body.programName;
    const school = req.body.school;
    const classCode = req.body.classCode;

    const newFormat = new Format({
      programCode: programCode,
      programName: programName,
      school: school,
      classCode: classCode,
    });

    const result = await newFormat.save();

    res.status(200).json({
      result,
    });
  } catch (error) {
    next(error);
  }
};

export const getClassFromSchool: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const school = req.query.school;

    const schoolClasses = await Timetables.find({ school: school }).select(
      "_id classNo program school"
    );

    const response = [];

    response.push({
      // name: `${}`
    });
  } catch (error) {
    next(error);
  }
};
