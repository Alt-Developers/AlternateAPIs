import env from "dotenv";
import Timetable from "../models/ss_timetables/timetable";
import User from "../models/ss_Account/user";
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
import userClass from "../models/ss_timetables/userClass";
import validationErrCheck from "../utilities/validationErrChecker";
import { programTypes } from "../models/ss_timetables/data";

const colorList = [
  "#ffd454",
  "#39df70",
  "#27989C",
  "#62221D",
  "#044B79",
  "#B71033",
  "#2DD7B6",
  "#5E4DFC",
  "#3164E2",
  "#102F8A",
];

export const registerUserClass: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) return newError(404, "User not found.");

    const classNo = req.body.classNo;
    const program = req.body.program;
    let isPrimary = req.body.isPrimary;

    if (isPrimary === "true") isPrimary = true;
    if (isPrimary === "false") isPrimary = false;

    let thisClass = await userClass.findOne({
      classNo: classNo,
      program: program,
    });

    if (!thisClass) {
      const newClass = new userClass({
        classNo: classNo,
        program: program,
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
      console.log(user.timetables!.starred);
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

export const getUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) return newError(404, "User not found.");
    let primaryClass: any;
    const starredClasses: any[] = [];

    const randomColor = () => {
      const randomIndex = Math.trunc(Math.random() * colorList.length - 1);
      return colorList[randomIndex];
    };

    if (
      !user.timetables?.primaryClass &&
      user.timetables?.starred.length === 0
    ) {
      return res.status(200).json({
        firstName: user.firstName,
        lastName: user.lastName,
        color: randomColor(),
        profilePicture: user.avatar,
        primaryClass: false,
        starredClass: [],
      });
    }

    primaryClass = await userClass.findById(user.timetables?.primaryClass);
    const starredClass = await userClass.find({
      _id: user.timetables?.starred,
    });

    starredClass.forEach((cur) => {
      starredClasses.push({
        className: `${cur.program === "english" ? "EP" : "M"} ${cur.classNo}`,
        color: randomColor(),
        classNo: cur.classNo,
        program: cur.program,
      });
    });

    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      color: randomColor(),
      profilePicture: user.avatar,
      primaryClass: {
        className: `${primaryClass.program === "english" ? "EP" : "M"} ${
          primaryClass.classNo
        }`,
        color: randomColor(),
        classNo: primaryClass.classNo,
        program: primaryClass.program,
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

    const existedUserClass = await UserClass.findOne({
      classNo: classNo,
      program: program,
    });

    if (!timetableContent.monday) newError(400, "monday must be filled");
    if (!timetableContent.tuesday) newError(400, "tuesday must be filled");
    if (!timetableContent.wednesday) newError(400, "wednesday must be filled");
    if (!timetableContent.thursday) newError(400, "thursday must be filled");
    if (!timetableContent.friday) newError(400, "friday must be filled");

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

    const newTimetable = new Timetable({
      classNo: classNo,
      program: program,
      defaultColor: defaultColor,
      timetableContent: timetableContent,
      createdBy: creator,
    });

    const result = await newTimetable.save();

    let classResult;
    if (!existedUserClass) {
      const newUserClass = new userClass({
        classNo: classNo,
        program: program,
        defaultColor: defaultColor,
        timetable: result._id,
      });
      classResult = await newUserClass.save();
    } else {
      existedUserClass.timetable = result._id;
      classResult = await existedUserClass.save();
    }

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

    res.status(200).json({
      className: `${thisTimetable.program === "english" ? "EP" : "M"} ${
        thisTimetable.classNo
      }`,
      color: color,
      content: thisTimetable.timetableContent,
      detail: {
        classNo: thisTimetable.classNo,
      },
    });
  } catch (err) {
    next(err);
  }
};
