import { RequestHandler } from "express";
import { DateTime, NumberUnitLength, Settings } from "luxon";
import User from "../models/authentication/user";
import Format from "../models/timetables/Format";
import Timetables from "../models/timetables/Timetables";
import UniversalFormat from "../models/timetables/UniversalFormat";
import { TimetableContentInterface } from "../models/types/modelType";
import newError from "../utilities/newError";
import validationErrCheck from "../utilities/validationErrChecker";
import identifyCurClass, {
  schoolTimetables,
} from "../utilities/timetables/identifyCurClass";
import getCurTime from "../utilities/timetables/getCurTime";

const classPrefixFormat = {
  ENGPG: "EP",
  IGCSE: "Year",
  A_LVL: "Year",
  PREIG: "Year",
};

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
    const year = req.body.year;

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
      year: year,
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

export const getFormat: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const school: any = req.query.school || "";
    const program: any = req.query.program || "";
    const language = req.query.language || "EN";

    if (language !== "TH" && language !== "EN") {
      return newError(
        400,
        "Language Not Supported / Not Found|Try re-submit the request."
      );
    }

    const schoolRegex = new RegExp(school, "g");
    const programRegex = new RegExp(program, "g");

    const format = await Format.find({
      school: schoolRegex,
      programCode: programRegex,
    });
    const universalFormat = await UniversalFormat.findOne()!;

    const formattedFormat: any = {};

    format.forEach((cur) => {
      const key: string = cur.programCode;
      const school: string = cur.school;

      formattedFormat[school] = {
        [key]: {
          ...formattedFormat[school],
          ...cur.classCode[language],
          ...universalFormat?.universalCodes[language],
        },
      };

      // console.log({})
    });

    res.status(200).json({
      formattedFormat,
    });
  } catch (error) {
    next(error);
  }
};

export const getClassFromSchool: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user)
      return newError(
        404,
        "Critical Error Has Occured|Please contect system administrator immediately. CODE[USR0001]",
        "important"
      );

    const school = req.query.school;

    const schoolClasses = await Timetables.find({ school: school }).select(
      "_id classNo program school year"
    );

    const filteredClasses: any[] = [];
    schoolClasses.forEach((cur) => {
      if (!user.timetables?.starred.includes(cur._id)) {
        filteredClasses.push({
          _id: cur._id,
          classNo: cur.classNo,
          program: cur.program,
          school: cur.school,
          year: cur.year,
        });
      }
    });

    const response: any = [];

    filteredClasses.forEach((cur) => {
      console.log(cur);
      response.push({
        name: `${
          cur.program === "ENGPG"
            ? "EP"
            : cur.program === "IGCSE"
            ? "Year"
            : cur.program === "A-LVL"
            ? "Year"
            : "M"
        } ${cur.year}${cur.school === "ASSUMPTION" ? "/" : "-"}${cur.classNo}`,
        value: cur._id,
      });
    });

    res.json({
      response,
    });
  } catch (error) {
    next(error);
  }
};

export const getTimetable: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const classId = req.params.classId;

    const timetableData = await Timetables.findById(classId).select(
      "-createdAt -updatedAt -createdBy"
    );

    if (!timetableData)
      return newError(
        404,
        `Timetable Not Found|Can't find timetable with the id "${classId}"`,
        "prompt"
      );

    const timetableFormat = await Format.findOne({
      school: timetableData.school,
      programCode: timetableData.program,
    }).select("-_id -programName -programCode -school -__v");
    if (!timetableFormat)
      return newError(
        404,
        `Format Not Found|Can't find Format of the school ${timetableData.school} program ${timetableData.program}`,
        "prompt"
      );

    const now = getCurTime();
    const curClass = identifyCurClass(now.curTime, timetableData.school);

    let classIndex: number = 0;

    let curClassName =
      // @ts-ignore
      timetableData.timetableContent[now.curDay][+curClass.classIndex] || "FTD";

    let nextClassName =
      // @ts-ignore
      timetableData.timetableContent[now.curDay][+curClass.nextClassIndex];

    console.log({ curClassName, nextClassName });

    let previous: string;
    let thisClassIndex: number = 0;

    // @ts-ignore
    timetableData.timetableContent[now.curDay].push("FTD");

    // @ts-ignore
    timetableData.timetableContent[now.curDay].forEach((cur) => {
      console.log({ cur, curClassName, previous });
      if (cur !== curClassName && cur !== previous) classIndex++;
      previous = cur;
      if (cur === curClassName) {
        console.log("Found Index", classIndex);
        thisClassIndex = classIndex;
      }
    });

    console.log(thisClassIndex);

    // console.log(curClass);
    // @ts-ignore
    const processedTimetableTime = schoolTimetables[timetableData.school].map(
      (cur: number) => {
        return cur + "00";
      }
    );
    // @ts-ignore
    const processedTimetableBreakTime = schoolTimetables[
      `B${timetableData.school}`
    ].map((cur: number) => {
      return cur + "00";
    });

    res.status(200).json({
      timetableData,
      className: `${
        timetableData.program === "ENGPG"
          ? "EP"
          : timetableData.program === "IGCSE"
          ? "Year"
          : timetableData.program === "A-LVL"
          ? "Year"
          : "M"
      } ${timetableData.year}${
        timetableData.school === "ASSUMPTION" ? "/" : "-"
      }${timetableData.classNo}`,
      timetableFormat,
      identifier: {
        curClass: thisClassIndex,
        today: now.curWeekDay,
      },
      refresher: [
        ...new Set([...processedTimetableTime, ...processedTimetableBreakTime]),
      ],
    });
  } catch (error) {
    next(error);
  }
};

export const getGlance: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    const now = getCurTime();

    const user = await User.findById(userId);
    if (!user)
      return newError(
        404,
        "Critical Error Has Occured|Please contect system administrator immediately. CODE[USR0001]",
        "important"
      );

    if (!user.timetables?.primaryClass) {
      return res.status(200).json({
        curClass: "AYC",
        nextClass: "AYC",
        format: {
          classCode: {
            TH: {
              AYC: {
                name: "เพิ่มห้องของคุณ",
                icon: "FTD",
              },
            },
            EN: {
              AYC: {
                name: "Add Your Class",
                icon: "FTD",
              },
            },
          },
        },
      });
    }
    const timetableData = await Timetables.findById(
      user.timetables.primaryClass
    );
    if (!timetableData)
      return newError(
        404,
        `Timetable Not Found|Server can't find timetable with id "${user.timetables.primaryClass}"`
      );

    const timetableFormat = await Format.findOne({
      school: timetableData.school,
      programCode: timetableData.program,
    });
    if (!timetableFormat)
      return newError(
        404,
        `Format Not Found|Can't find Format of the school ${timetableData.school} program ${timetableData.program}`,
        "prompt"
      );
    const universalFormat = await UniversalFormat.findOne();
    if (!universalFormat)
      return newError(
        404,
        `Format Not Found|Can't find Format of the school ${timetableData.school} program ${timetableData.program}`,
        "prompt"
      );

    // @ts-ignore
    const processedTimetableTime = schoolTimetables[timetableData.school].map(
      (cur: number) => {
        return cur + "00";
      }
    );
    // @ts-ignore
    const processedTimetableBreakTime = schoolTimetables[
      `B${timetableData.school}`
    ].map((cur: number) => {
      return cur + "00";
    });

    const classIndex = identifyCurClass(now.curTime, timetableData.school);
    console.log("Class Index: ", classIndex);
    const refersherData = [
      ...new Set([...processedTimetableTime, ...processedTimetableBreakTime]),
    ];

    let thisClassTime = processedTimetableTime[classIndex.classIndex];
    let nextClassTime = processedTimetableTime[classIndex.nextClassIndex];
    let isConditional = false;

    if (now.curDay === "weekend") {
      thisClassTime = false;
      nextClassTime = false;
      isConditional = true;
    } else if (classIndex.classIndex === -1) {
      thisClassTime = false;
      nextClassTime = processedTimetableTime[0];
      isConditional = true;
    } else if (classIndex.classIndex === -2) {
      thisClassTime = false;
      nextClassTime = false;
      isConditional = true;
    } else if (classIndex.classIndex === -70) {
      thisClassTime = processedTimetableBreakTime[0];
      nextClassTime = processedTimetableBreakTime[1];
      isConditional = true;
    }

    let thisClassTimeClassName =
      // @ts-ignore
      timetableData.timetableContent[now.curDay][classIndex.classIndex];
    let previousClassName =
      // @ts-ignore
      timetableData.timetableContent[now.curDay][classIndex.classIndex - 1];

    const thisClassTimeClassNameBefore = thisClassTimeClassName;

    let classTimeNewIndex = classIndex.classIndex;

    while (thisClassTimeClassName === previousClassName) {
      thisClassTime = processedTimetableTime[classTimeNewIndex];

      thisClassTimeClassName =
        // @ts-ignore
        timetableData.timetableContent[now.curDay][classTimeNewIndex];

      previousClassName =
        // @ts-ignore
        timetableData.timetableContent[now.curDay][classTimeNewIndex - 1];

      classTimeNewIndex = classTimeNewIndex - 1;
    }

    if (thisClassTimeClassNameBefore !== thisClassTimeClassName)
      return newError(
        500,
        "Internal server error|Please contact system administators CODE[GLAN001]",
        "important"
      );

    console.log({
      classIndex: classIndex,
      timetable: processedTimetableTime,
      time: {
        thisClassTime,
        nextClassTime,
      },
    });

    const formattedFormat = {
      classCode: {
        TH: {
          ...timetableFormat.classCode.TH,
          ...universalFormat.universalCodes.TH,
        },
        EN: {
          ...timetableFormat.classCode.EN,
          ...universalFormat.universalCodes.EN,
        },
      },
    };
    if (now.curDay === "weekend") {
      return res.status(200).json({
        curClass: "WKN",
        nextClass: "WKN",
        format: formattedFormat,
        refresher: ["000010"],
        time: {
          thisClassTime,
          nextClassTime,
        },
      });
    }
    if (classIndex.classIndex === -1) {
      //@ts-ignore
      const nextClass = timetableData.timetableContent[now.curDay][0];

      return res.status(200).json({
        curClass: "BFS",
        nextClass: nextClass,
        format: formattedFormat,
        refresher: refersherData,
        time: {
          thisClassTime,
          nextClassTime,
        },
      });
    }
    if (classIndex.classIndex === -2) {
      return res.status(200).json({
        curClass: "FTD",
        nextClass: "FTD",
        format: formattedFormat,
        refresher: refersherData,
        time: {
          thisClassTime,
          nextClassTime,
        },
      });
    }
    if (classIndex.classIndex === -70) {
      console.log(classIndex.nextClassIndex);
      //@ts-ignore
      const nextClass =
        //@ts-ignore
        timetableData.timetableContent[now.curDay][classIndex.nextClassIndex];

      return res.status(200).json({
        curClass: "LUC",
        nextClass: nextClass,
        format: formattedFormat,
        refresher: refersherData,
        time: {
          thisClassTime,
          nextClassTime,
        },
      });
    }

    let nextClass =
      //@ts-ignore
      timetableData.timetableContent[now.curDay][classIndex.nextClassIndex] ||
      "FTD";
    //@ts-ignore
    let curClass =
      //@ts-ignore
      timetableData.timetableContent[now.curDay][classIndex.classIndex] ||
      "FTD";
    if (
      // @ts-ignore
      timetableData.timetableContent[now.curDay].length > classIndex.classIndex
    ) {
      let i = classIndex.nextClassIndex + 1;
      while (curClass === nextClass) {
        console.log({
          curClass,
          nextClass,
        });
        //@ts-ignore
        nextClass = timetableData.timetableContent[now.curDay][i];
        if (!isConditional) {
          nextClassTime = processedTimetableTime[i];
        }
        i = i + 1;
      }
    } else {
      curClass = "FTD";
    }

    return res.status(200).json({
      curClass: curClass,
      nextClass: nextClass || "FTD",
      format: formattedFormat,
      refresher: refersherData,
      time: {
        thisClassTime,
        nextClassTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const registerUserClass: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const userId = req.userId;

    const classId = req.body.classId;
    const isPrimary = req.body.isPrimary;

    const user = await User.findById(userId);
    if (!user)
      return newError(
        404,
        "Critical Error Has Occured|Please contect system administrator immediately. CODE[USR0001]",
        "important"
      );

    if (user.timetables?.primaryClass) {
      if (!user.timetables?.primaryClass && !isPrimary) {
        return newError(
          404,
          "Primary Class Not Set|Before Setting anything please set primary class first.",
          "user"
        );
      }
      if (user.timetables?.starred.includes(classId) && !isPrimary) {
        return newError(
          409,
          "Class Already Starred|This class has already been stared before this.",
          "user"
        );
      }
      if (classId === user.timetables?.primaryClass.toString() && isPrimary) {
        return newError(
          409,
          "Already a primary Class|This class has already your primary class",
          "user"
        );
      }

      if (classId === user.timetables?.primaryClass.toString()) {
        return newError(
          409,
          "Can't Add Primary Class to the starred List|Due to system's limitation you need to change your primary class to other class first to ad this class to the starred list",
          "user"
        );
      }
    }
    if (isPrimary) {
      if (user.timetables?.starred.includes(classId)) {
        const filtered = user.timetables.starred.filter(
          (cur) => cur.toString() !== classId.toString()
        );
        user.timetables.starred = filtered;
      }

      user.timetables!.primaryClass = classId;
    }
    if (!isPrimary) {
      user.timetables?.starred.push(classId);
    }

    const result = await user.save();

    res.json({
      result,
    });
  } catch (error) {
    next(error);
  }
};

export const removeClassFromUser: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const userId = req.userId;

    const classId = req.body.classId;

    const user = await User.findById(userId);
    if (!user)
      return newError(
        404,
        "Critical Error Has Occured|Please contect system administrator immediately. CODE[USR0001]",
        "important"
      );

    if (!user.timetables?.starred.includes(classId)) {
      return newError(
        409,
        `Class' not on the list|The class with id ${classId} is not on the list at the first place.`,
        "user"
      );
    }

    const filtered = user.timetables.starred.filter(
      (cur) => cur.toString() !== classId.toString()
    );
    user.timetables.starred = filtered;

    const result = await user.save();

    res.status(200).json({
      result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyClass: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user)
      return newError(
        404,
        "Critical Error Has Occured|Please contect system administrator immediately. CODE[USR0001]",
        "important"
      );

    const primaryClass = await Timetables.findById(
      user.timetables?.primaryClass
    );
    if (!primaryClass) {
      return res.json({
        primaryClass: false,
        starredClasses: false,
      });
    }

    const starredClasses =
      (await Timetables.find({ _id: user.timetables?.starred })) || [];

    const foramttedData: any[] = [];

    starredClasses.forEach((cur) => {
      // @ts-ignore
      const thisClassPrefix: string = classPrefixFormat[cur.program] || "M";

      foramttedData.push({
        _id: cur.id,
        school: cur.school,
        className: `${thisClassPrefix} ${cur.year}${
          cur.school === "ASSUMPTION" ? "/" : "-"
        }${cur.classNo}`,
        color: cur.color,
      });
    });

    const primaryClassPrefix: string =
      // @ts-ignore
      classPrefixFormat[primaryClass.program] || "M";

    res.status(200).json({
      primaryClass: {
        _id: primaryClass._id,
        school: primaryClass?.school,
        className: `${primaryClassPrefix} ${primaryClass.year}${
          primaryClass.school === "ASSUMPTION" ? "/" : "-"
        }${primaryClass.classNo}`,
        color: primaryClass.color,
      },
      starredClass: foramttedData,
    });
  } catch (error) {
    next(error);
  }
};
