import env from "dotenv";
import Timetable from "../models/ss_timetables/timetable";
import User from "../models/authentication/user";
import UserClass from "../models/ss_timetables/userClass";
import {
  TimetableContentInterface,
  TimetableInterface,
  ClassesInterface,
} from "../models/types";
import { RequestHandler } from "express";
import newError from "../utilities/newError";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import validationErrCheck from "../utilities/validationErrChecker";
import { programTypes, classTime } from "../models/ss_timetables/data";
import Code from "../models/ss_timetables/code";
import { DateTime, NumberUnitLength, Settings } from "luxon";
import socket from "../socket";
import UniversalCode from "../models/ss_timetables/universalCode";
import identifyCurrentClassIndex from "../utilities/identifyCurrentClass";
// const timeCalculator = require("working-time-calculator");

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

  if (
    advanceTime === 83000 ||
    advanceTime === 92000 ||
    advanceTime === 110000 ||
    advanceTime === 114000 ||
    advanceTime === 124000 ||
    advanceTime === 133000 ||
    advanceTime === 142000 ||
    advanceTime === 150000
  ) {
    console.log("emitting the message!");
    socket.getIO().emit("glance", {
      action: "refresh",
      currentTime: curTime,
    });
  }

  // console.log(curDay, curWeekDay, advanceTime);
}, 1000);

export const registerUserClass: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) return newError(404, "User not found.");

    const classNo = req.body.classNo;
    const program = req.body.program;
    const color = req.body.program;
    let isPrimary = req.body.isPrimary;

    if (isPrimary === "true") isPrimary = true;
    if (isPrimary === "false") isPrimary = false;

    let thisClass = await UserClass.findOne({
      classNo: classNo,
      program: program,
    });

    if (!thisClass) {
      const newClass = new UserClass({
        classNo: classNo,
        program: program,
        defaultColor: color,
      });
      thisClass = await newClass.save();
    }

    // if (!userTimetableId)
    //   return newError(404, "Class's timetable not yet existed");

    if (user.timetables?.primaryClass === thisClass._id)
      newError(409, "This class is already user's primary class.");

    if (isPrimary === true) {
      if (user.timetables?.starred.includes(thisClass._id)) {
        const filtered = user.timetables.starred.filter((cur) => {
          cur.toString() !== thisClass?._id.toString();
        });
        user.timetables.starred = filtered;
      }
      user.timetables!.primaryClass = thisClass._id;
    } else {
      if (user.timetables?.starred.includes(thisClass._id))
        newError(409, "This class is already in user's starred class.");
      user.timetables!.starred.push(thisClass._id);
    }

    const result = await user.save();

    res.status(200).json({
      message: "Successfully Registered user's class.",
      userFirstName: user.firstName,
      setPrimary: isPrimary,
      classDetail: {
        classId: thisClass._id,
        classNo: thisClass.classNo,
        program: thisClass.program,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const removeClassFromUser: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const userId = req.userId;

    const classNo = req.body.classNo;
    const program = req.body.program;

    const user = await User.findById(userId);

    if (!user) return newError(404, "User Not found.");

    if (!user.timetables)
      return newError(400, "This account not migrated yet!");

    const thisClass = await UserClass.findOne({
      classNo: classNo,
      program: program,
    });
    if (!thisClass) return newError(404, "Class not existed.");

    const filtered = user.timetables?.starred.filter(
      (cur) => cur.toString() !== thisClass._id.toString()
    );
    user.timetables.starred = filtered;

    const result = await user.save();

    res.status(200).json({
      starredNow: user.timetables.starred,
    });
  } catch (err) {
    next(err);
  }
};

export const getNotUserClass: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) return newError(404, "User not found.");

    const allClass = await UserClass.find();
    if (!allClass) return newError(500, "Something went wrong.");

    let filtered = allClass.filter((cur) => {
      return !user.timetables?.starred.includes(cur._id);
    });

    if (user.timetables?.primaryClass) {
      filtered = filtered.filter((cur) => {
        return cur._id.toString() !== user.timetables?.primaryClass.toString();
      });
    }

    const formattedData: any[] = [];

    filtered.forEach((cur) => {
      formattedData.push({
        className: `${cur.program === "ENPG" ? "EP" : "M"} ${cur.classNo}`,
        classNo: cur.classNo,
        program: cur.program,
      });
    });

    res.status(200).json({
      data: formattedData,
    });
  } catch (err) {
    next(err);
  }
};

export const getUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) return newError(404, "User not found.");
    let primaryClass: any;
    const starredClasses: any[] = [];

    if (!user.timetables?.primaryClass) {
      return res.status(200).json({
        firstName: user.firstName,
        lastName: user.lastName,
        color: user.preferredColor,
        profilePicture: user.avatar,
        glance: {
          currentClass: "AYC",
          nextClass: "AYC",
        },
        config: {
          dateTime: "24h",
          showCovid: "covShow",
          language: "EN",
        },
        primaryClass: false,
        starredClass: [],
      });
    }

    primaryClass = await UserClass.findById(user.timetables?.primaryClass);
    const starredClass = await UserClass.find({
      _id: user.timetables?.starred,
    });

    starredClass.forEach((cur) => {
      starredClasses.push({
        className: `${cur.program === "ENPG" ? "EP" : "M"} ${cur.classNo}`,
        color: cur.defaultColor,
        classNo: cur.classNo,
        program: cur.program,
      });
    });

    let curClass;
    let nextClass;
    if (user.timetables.primaryClass) {
      if (curDay !== "weekend") {
        const userClass = await UserClass.findById(
          user.timetables.primaryClass
        );
        if (userClass?.timetable) {
          const thisClassIndex = identifyCurrentClassIndex(curTime);
          const userTimetable = await Timetable.findById(userClass?.timetable);

          // if (thisClassIndex === false) curClass = "BFS";
          // curClass =

          // userTimetable?.timetableContent[time.curDay][thisClassIndex];

          if (thisClassIndex !== 6) {
            nextClass =
              // @ts-ignore
              userTimetable?.timetableContent[curDay][thisClassIndex + 1];
          } else if (thisClassIndex === 6) {
            curWeekDay = curWeekDay + 1;
            // nextClass =
            //   // @ts-ignore
            //   userTimetable?.timetableContent[tmrDay][0];
            // console.log(nextClass);
            nextClass = "FTD";
          }

          if (curTime < 1140 || curTime >= 1240) {
            // @ts-ignore
            curClass = userTimetable?.timetableContent[curDay][thisClassIndex];
          }
          if (curTime >= 1140 && curTime < 1240) curClass = "LUC";
          if (curTime >= 1100 && curTime < 1140) nextClass = "LUC";
          if (curTime < 830) curClass = "BFS";
          if (curTime >= 1500) {
            curClass = "FTD";
            nextClass = "FTD";
          }
        }
      } else {
        curClass = "WKN";
        nextClass = "WKN";
      }
    }

    // const timeUntillNextPeriod = timeCalculator.calcMinutesBetween();

    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      color: user.preferredColor,
      profilePicture: user.avatar,
      primaryClass: {
        className: `${primaryClass.program === "ENPG" ? "EP" : "M"} ${
          primaryClass.classNo
        }`,
        color: primaryClass.defaultColor,
        classNo: primaryClass.classNo,
        program: primaryClass.program,
      },
      glance: {
        currentClass: curClass,
        nextClass: nextClass,
      },
      config: {
        dateTime: user.preferredConfig.dateTime || "24h",
        showCovid: user.preferredConfig.showCovid || "covShow",
        language: user.preferredConfig.language || "EN",
      },
      starredClasses: starredClasses,
    });
  } catch (err) {
    next(err);
  }
};

export const createTimetable: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const userId = req.userId;

    const classNo: string = req.body.classNo;
    const timetableContent: TimetableContentInterface = req.body.content;
    const defaultColor: string = req.body.color;
    const program: string = req.body.program;

    const user = await User.findById(userId);
    if (!user) return newError(404, "User not found.");
    const creator = user._id;

    const timetable = await Timetable.findOne({ classNo: classNo });
    if (timetable) {
      if (timetable.program === program) {
        return newError(409, "This class timetables already existed.");
      }
    }

    let classResult = await UserClass.findOne({
      classNo: classNo,
      program: program,
    });

    if (!timetableContent.monday) newError(400, "monday must be filled");
    if (!timetableContent.tuesday) newError(400, "tuesday must be filled");
    if (!timetableContent.wednesday) newError(400, "wednesday must be filled");
    if (!timetableContent.thursday) newError(400, "thursday must be filled");
    if (!timetableContent.friday) newError(400, "friday must be filled");
    const code = await Code.findOne({ programCode: program });
    if (!code) return newError(404, "Program not found.");
    const subjectCode = Object.keys(code.classCode.EN);

    timetableContent.monday.forEach((cur) => {
      if (!subjectCode.includes(cur))
        newError(400, "Wrong subject Code [MONDAY]");
    });

    timetableContent.tuesday.forEach((cur) => {
      if (!subjectCode.includes(cur))
        newError(400, "Wrong subject Code [TUESDAY]");
    });

    timetableContent.wednesday.forEach((cur) => {
      if (!subjectCode.includes(cur))
        newError(400, "Wrong subject Code [WEDNESDAY]");
    });

    timetableContent.thursday.forEach((cur) => {
      if (!subjectCode.includes(cur))
        newError(400, "Wrong subject Code [THURSDAY]");
    });

    timetableContent.friday.forEach((cur) => {
      if (!subjectCode.includes(cur))
        newError(400, "Wrong subject Code [FRIDAY]");
    });

    if (timetableContent) {
      if (
        timetableContent.monday.length !== 7 ||
        timetableContent.tuesday.length !== 7 ||
        timetableContent.wednesday.length !== 7 ||
        timetableContent.thursday.length !== 7 ||
        timetableContent.friday.length !== 7
      ) {
        return newError(400, "The number of subject per day must be 7.");
      }
    } else {
      return newError(
        400,
        "Must include content of the timetable in the request's body."
      );
    }

    if (!classResult) {
      const newUserClass = new UserClass({
        classNo: classNo,
        program: program,
        defaultColor: defaultColor,
      });
      classResult = await newUserClass.save();
    }

    const newTimetable = new Timetable({
      classNo: classNo,
      classId: classResult?._id,
      program: program,
      defaultColor: defaultColor,
      timetableContent: timetableContent,
      createdBy: creator,
    });

    const result = await newTimetable.save();

    classResult.timetable = result._id;
    await classResult.save();

    // @ts-ignore
    const programName: String = programTypes[program];

    res.status(201).json({
      timetableId: result._id,
      classNo: result.classNo,
      program: programName,
      class: {},
    });
  } catch (err) {
    next(err);
  }
};

export const getTimetable: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;

    const classRequested = req.query.classNo?.toString();
    const programRequested = req.query.program?.toString();
    let color;

    const user = await User.findById(userId);
    if (!user) return newError(404, "User not found.");

    const thisTimetable = await Timetable.findOne({
      classNo: classRequested,
      program: programRequested,
    });
    if (!thisTimetable)
      return newError(404, "this class timetable does not existed yet.");

    if (user.timetables?.preferredColor) color = user.timetables.preferredColor;
    if (!user.timetables?.preferredColor) color = thisTimetable.defaultColor;

    let thisClassIndex: number = identifyCurrentClassIndex(curTime);

    let tmrDay;
    // @ts-ignore
    if (curWeekDay === 6 || curWeekDay === 5) {
      tmrDay = "weekend";
    } else {
      if (curWeekDay === 7) tmrDay = "monday";
      if (curWeekDay === 1) tmrDay = "tuesday";
      if (curWeekDay === 2) tmrDay = "wednesday";
      if (curWeekDay === 3) tmrDay = "thursday";
      if (curWeekDay === 4) tmrDay = "friday";
    }

    if (curTime >= 1140 && curTime < 1240) thisClassIndex = 3.5;

    // console.log(curWeekDay, curDay, tmrDay);

    res.status(200).json({
      className: `${thisTimetable.program === "ENPG" ? "EP" : "M"} ${
        thisTimetable.classNo
      }`,
      color: color,
      content: thisTimetable.timetableContent,
      detail: {
        classNo: thisTimetable.classNo,
      },
      identifier: {
        curClass: {
          index: curDay === "weekend" ? 10 : thisClassIndex,
          day: curDay === "weekend" ? "monday" : curDay,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const newProgram: RequestHandler = async (req, res, next) => {
  const programCode = req.body.code;
  const programName = req.body.programName;
  const classCode = req.body.classCode;

  // console.log(classCode);
  const newCode = new Code({
    programCode: programCode,
    programName: programName,
    classCode: classCode,
  });

  const result = await newCode.save();
  // console.log(result);

  res.json({
    result,
  });
};

export const getCode: RequestHandler = async (req, res, next) => {
  const language = req.query.language;
  try {
    // console.log(language !== "EN");
    // console.log(language !== "TH");
    // console.log(language);
    // @ts-ignore
    if (language !== "EN" && language !== "TH")
      return newError(400, 'languages shall be "TH" or "EN"');

    const codes = await Code.find();
    const universalCode = await UniversalCode.findOne();
    if (!codes || !universalCode) return newError(500, "Somthing went worng.");

    const formattedCode: any = {};

    codes.forEach((cur) => {
      const key: string = cur.programCode;
      // console.log(cur.classCode.EN);
      formattedCode[key] = {
        ...cur.classCode[language],
        ...universalCode.universalCodes[language],
      };
    });

    // const formattedCode: any = {};
    // codes.forEach((cur) => {
    //   const key: string = cur.programCode;
    //   formattedCode.EN[key] = cur.classCode.EN;

    //   formattedCode.TH[key] = cur.classCode.EN;

    // });

    res.status(200).json({
      totalAmountOfPrograms: await Code.find().countDocuments(),
      codes: formattedCode,
    });
  } catch (err) {
    next(err);
  }
};

export const socketRefresh: RequestHandler = (req, res, next) => {
  try {
    socket.getIO().emit("glance", {
      action: "refresh",
      currentTime: curTime,
    });
    res.status(200).json({
      message: "Successfully emitted.",
    });
  } catch (err) {
    next(err);
  }
};

export const newUniversalClass: RequestHandler = async (req, res, next) => {
  try {
    const newClassCode: string = req.body.code;
    const newClassNameEN: string = req.body.ENName;
    const newClassNameTH: string = req.body.THName;
    const newClassIcon: string = req.body.icon;

    const universalCodes = await UniversalCode.findOne();
    if (!universalCodes) return newError(500, "Server-side Error");

    // @ts-ignore
    universalCodes.universalCodes.TH[newClassCode] = {
      name: newClassNameTH,
      icon: newClassIcon,
    };
    // @ts-ignore
    universalCodes.universalCodes.EN[newClassCode] = {
      name: newClassNameEN,
      icon: newClassIcon,
    };

    // console.log(universalCodes);
    universalCodes.markModified("universalCodes");
    await universalCodes.save();
    res.status(201).json({
      message: "success!",
    });
  } catch (err) {
    next(err);
  }
};

export const getGlance: RequestHandler = async (req, res, next) => {
  try {
    const classNo = req.query.classNo;
    const program = req.query.program;
    const thisClassIndex = identifyCurrentClassIndex(curTime);

    const timetable = await Timetable.findOne({
      classNo: classNo,
      program: program,
    });

    let nextClass;
    let curClass;
    if (curDay !== "weekend") {
      if (thisClassIndex !== 6) {
        nextClass =
          // @ts-ignore
          userTimetable?.timetableContent[curDay][thisClassIndex + 1];
      } else if (thisClassIndex === 6) {
        curWeekDay = curWeekDay + 1;
        // let tmrDay;
        // if (curWeekDay === 1) tmrDay = "monday";
        // if (curWeekDay === 2) tmrDay = "tuesday";
        // if (curWeekDay === 3) tmrDay = "wednesday";
        // if (curWeekDay === 4) tmrDay = "thursday";
        // if (curWeekDay === 5) tmrDay = "friday";
        // console.log(curDay, tmrDay);
        // nextClass =
        //   // @ts-ignore
        //   userTimetable?.timetableContent[tmrDay][0];
        // console.log(nextClass);
        nextClass = "FTD";
      }

      if (curTime < 1140 || curTime >= 1240) {
        // @ts-ignore
        curClass = userTimetable?.timetableContent[curDay][thisClassIndex];
      }
      if (curTime >= 1140 && curTime < 1240) curClass = "LUC";
      if (curTime >= 1100 && curTime < 1140) nextClass = "LUC";
      if (curTime < 830) curClass = "BFS";
      if (curTime >= 1500) {
        curClass = "FTD";
        nextClass = "FTD";
      }
    } else {
      curClass = "WKN";
      nextClass = "WKN";
    }
  } catch (err) {
    next(err);
  }
};
