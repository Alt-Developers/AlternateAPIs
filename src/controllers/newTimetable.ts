import e, { RequestHandler } from "express";
import { DateTime, NumberUnitLength, Settings } from "luxon";
import User from "../models/authentication/user";
import Format from "../models/timetables/Format";
import Timetables from "../models/timetables/Timetables";
import UniversalFormat from "../models/timetables/UniversalFormat";
import {
  AvaliableSchool,
  ClassInfoInterface,
  HolidayInterface,
  TimetableContentInterface,
  TimetableRequestInterface,
} from "../models/types/modelType";
import newError from "../utilities/newError";
import validationErrCheck from "../utilities/validationErrChecker";
import identifyCurClass, {
  schoolTimetables,
} from "../utilities/timetables/identifyCurClass";
import getCurTime from "../utilities/timetables/getCurTime";
import Holiday from "../models/timetables/Holiday";
import TimetableRequest from "../models/timetables/TimetableRequest";
import user from "../models/authentication/user";
import TimeLayout from "../models/timetables/TimeLayout";

const classPrefixFormat = {
  ENGPG: "EP",
  IGCSE: "Year",
  A_LVL: "Year",
  PREIG: "Year",
};

const days = [
  "weekend",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "weekend",
  "monday",
];

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

    if (user.accType !== "developer")
      return newError(
        403,
        "Forbidden|You do not have sufficient rights to access this resource",
        "user"
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

    // console.log({ school, timetableContent, program, classNo, color });

    const allCode = await Format.find();
    // console.log({ allCode });

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
      status: "uptodate",
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

    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user)
      return newError(
        404,
        "Critical Error Has Occured|Please contect system administrator immediately.",
        "important"
      );

    if (user.accType !== "developer")
      return newError(
        403,
        "Forbidden|You do not have sufficient rights to access this resource",
        "user"
      );

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

    const primaryClassPrefix: string =
      //@ts-ignore
      classPrefixFormat[primaryClass.program] || "M";

    filteredClasses.forEach((cur) => {
      // console.log(cur);
      response.push({
        name: `${primaryClassPrefix} ${cur.year}${
          cur.school === "ASSUMPTION" ? "/" : "-"
        }${cur.classNo}`,
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
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user)
      return newError(
        404,
        "Critical Error Has Occured|Please contect system administrator immediately. CODE[USR0001]",
        "important"
      );

    const timetableData = await Timetables.findById(classId).select(
      "-createdAt -updatedAt -createdBy"
    );

    if (!timetableData)
      return newError(
        404,
        `Timetable Not Found|Can't find timetable with the id "${classId}"`,
        "prompt"
      );

    const timetableTimeLayout = await TimeLayout.findOne({
      school: timetableData.school,
      program: timetableData.program,
    });
    if (!timetableTimeLayout)
      return newError(
        404,
        "Time Layout Not Found|Critical Error Has Occurred Timetable Time Layout Not Found.",
        "important"
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
    const isConditional = now.curDay === "weekend";

    let classIndex: number = 0;

    let [curClassName, nextClassName] = ["FTD", "FTD"];
    if (!isConditional) {
      curClassName =
        // @ts-ignore
        timetableData.timetableContent[now.curDay][+curClass.classIndex] ||
        "FTD";

      nextClassName =
        // @ts-ignore
        timetableData.timetableContent[now.curDay][+curClass.nextClassIndex];
    }
    // console.log({ curClassName, nextClassName });

    let previous: string;
    let thisClassIndex: number = -1;

    const processedTimetableTodayData =
      // @ts-ignore
      timetableData.timetableContent[now.curDay] || [];

    // @ts-ignore
    processedTimetableTodayData.push("FTD");

    // @ts-ignore
    processedTimetableTodayData.forEach((cur) => {
      // console.log({ cur, curClassName, previous });
      if (cur !== curClassName && cur !== previous) classIndex++;
      previous = cur;
      if (cur === curClassName && !isConditional) {
        // console.log("Found Index", classIndex);
        thisClassIndex = classIndex;
      }
    });

    // console.log(thisClassIndex);

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

    let isPrimaryClass: boolean = false;

    if (
      user.timetables?.primaryClass.toString() === timetableData._id.toString()
    ) {
      isPrimaryClass = true;
    }

    const primaryClassPrefix: string =
      // @ts-ignore
      classPrefixFormat[primaryClass.program] || "M";

    res.status(200).json({
      timetableData,
      timetableTimeLayout: timetableTimeLayout.time,
      isPrimaryClass: isPrimaryClass,
      className: `${primaryClassPrefix} ${timetableData.year}${
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
      status: timetableData.status,
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

    const curDate = new Date();

    const simplifiedDate = `${curDate.getDate()}${
      curDate.getMonth() + 1
    }${curDate.getFullYear()}`;

    let holiday: HolidayInterface | null | undefined;

    holiday = await Holiday.findOne({
      date: simplifiedDate,
      type: "public",
    });

    if (!holiday) {
      holiday = await Holiday.findOne({
        date: simplifiedDate,
        type: "specific",
        school: timetableData.school,
      });
    }

    if (holiday) {
      return res.status(200).json({
        curClass: holiday.type === "specific" ? "SSH" : "PHD",
        nextClass: holiday.type === "specific" ? "SSH" : "PHD",
        name: {
          TH: holiday.name.TH,
          EN: holiday.name.EN,
        },
        desc: {
          TH: holiday.desc.TH,
          EN: holiday.desc.EN,
        },
        format: {
          classCode: {
            EN: universalFormat.universalCodes.EN,
            TH: universalFormat.universalCodes.TH,
          },
        },
        refresher: ["000010"],
      });
    }

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

    // @ts-ignore
    if (schoolTimetables[timetableData.school][0] - 100 > now.curTime) {
      if (user.preferredConfig.tmrPref === "book") {
        const today =
          days[now.curWeekDay] === "weekend" ? "monday" : days[now.curWeekDay];

        const yesterday =
          days[now.curWeekDay - 1] === "weekend"
            ? "friday"
            : days[now.curWeekDay - 1];

        const tmrDay =
          days[now.curWeekDay + 1] === "weekend"
            ? "monday"
            : days[now.curWeekDay + 1];

        const toAdd: any = [
          //@ts-ignore
          ...new Set(timetableData.timetableContent[today]),
        ].map(
          (cur) =>
            //@ts-ignore
            formattedFormat.classCode[user.preferredConfig.language][cur]
        );

        const toAddNameArr = toAdd.map(
          (cur: { icon: string; name: string }) => cur.name
        );

        const toRemove: any = [
          ...new Set(
            // @ts-ignore
            timetableData.timetableContent[yesterday]
          ),
        ]
          .map(
            (cur) =>
              //@ts-ignore
              formattedFormat.classCode[user.preferredConfig.language][cur]
          )
          .filter((cur: any) => !toAddNameArr.includes(cur.name));

        return res.status(200).json({
          curClass: "FTD",
          nextClass: "FTD",
          format: {
            classCode: {
              EN: universalFormat.universalCodes.EN,
              TH: universalFormat.universalCodes.TH,
            },
          },
          refresher: [`${processedTimetableTime[0] + 50}`],
          prepType: "book",
          prep: {
            toRemove: toRemove,
            toAdd: toAdd,
          },
        });
      } else if (user.preferredConfig.tmrPref === "subject") {
        const today =
          days[now.curWeekDay] === "weekend" ? "monday" : days[now.curWeekDay];

        const yesterday =
          days[now.curWeekDay - 1] === "weekend"
            ? "friday"
            : days[now.curWeekDay - 1];

        const tmrDay =
          days[now.curWeekDay + 1] === "weekend"
            ? "monday"
            : days[now.curWeekDay + 1];

        const toAdd: any =
          //@ts-ignore
          [...new Set(timetableData.timetableContent[today])].map(
            (cur) =>
              //@ts-ignore
              formattedFormat.classCode[user.preferredConfig.language][cur]
          );

        return res.status(200).json({
          curClass: "FTD",
          nextClass: "FTD",
          format: {
            classCode: {
              EN: universalFormat.universalCodes.EN,
              TH: universalFormat.universalCodes.TH,
            },
          },
          refresher: [`${processedTimetableTime[0] + 50}`],
          prepType: "subject",
          prep: {
            toAdd: toAdd,
          },
        });
      } else {
        return res.status(200).json({
          curClass: "FTD",
          nextClass: "FTD",
          format: {
            classCode: {
              EN: universalFormat.universalCodes.EN,
              TH: universalFormat.universalCodes.TH,
            },
          },
          refresher: [`${processedTimetableTime[0] + 50}`],
          prepType: "hide",
        });
      }
    }

    const classIndex = identifyCurClass(now.curTime, timetableData.school);
    // console.log("Class Index: ", classIndex);
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

    let thisClassTimeClassName: string;
    let previousClassName: string;
    if (isConditional) {
      thisClassTimeClassName = "CN1";

      previousClassName = "CN2";
    } else {
      thisClassTimeClassName =
        // @ts-ignore
        timetableData.timetableContent[now.curDay][classIndex.classIndex] ||
        "FT1";
      previousClassName =
        // @ts-ignore
        timetableData.timetableContent[now.curDay][classIndex.classIndex - 1] ||
        "FT2";
    }

    const thisClassTimeClassNameBefore = thisClassTimeClassName;

    let classTimeNewIndex = classIndex.classIndex;
    let thisClassInitialSimpleTime: number =
      //@ts-ignore
      schoolTimetables[timetableData.school][classTimeNewIndex];

    const thisClassSimpleTime: number =
      // @ts-ignore
      schoolTimetables[timetableData.school][classTimeNewIndex];

    // console.log({
    //   thisClassTimeClassName,
    //   previousClassName,
    //   thisClassTimeClassNameBefore,
    // });
    while (thisClassTimeClassName === previousClassName) {
      thisClassTime = processedTimetableTime[classTimeNewIndex];
      thisClassInitialSimpleTime =
        //@ts-ignore
        schoolTimetables[timetableData.school][classTimeNewIndex];

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

    // console.log({
    //   classIndex: classIndex,
    //   timetable: processedTimetableTime,
    //   time: {
    //     thisClassTime,
    //     nextClassTime,
    //   },
    // });

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
      if (user.preferredConfig.tmrPref === "book") {
        const today =
          days[now.curWeekDay] === "weekend" ? "friday" : days[now.curWeekDay];

        const yesterday =
          days[now.curWeekDay - 1] === "weekend"
            ? "friday"
            : days[now.curWeekDay - 1];

        const tmrDay =
          days[now.curWeekDay + 1] === "weekend"
            ? "monday"
            : days[now.curWeekDay + 1];

        const toAdd: any =
          //@ts-ignore
          [
            ...new Set(
              // @ts-ignore
              timetableData.timetableContent[tmrDay]
            ),
          ].map(
            (cur) =>
              //@ts-ignore
              formattedFormat.classCode[user.preferredConfig.language][cur]
          );

        const toAddNameArr = toAdd.map(
          (cur: { icon: string; name: string }) => cur.name
        );

        const toRemove: any = [
          ...new Set(
            // @ts-ignore
            timetableData.timetableContent[today]
          ),
        ]
          .map(
            (cur) =>
              //@ts-ignore
              formattedFormat.classCode[user.preferredConfig.language][cur]
          )
          .filter((cur) => !toAddNameArr.includes(cur.name));

        return res.status(200).json({
          curClass: "FTD",
          nextClass: "FTD",
          format: formattedFormat,
          refresher: refersherData,
          prepType: "book",
          prep: {
            toRemove: toRemove,
            toAdd: toAdd,
          },
          time: {
            thisClassTime,
            nextClassTime,
          },
        });
      } else if (user.preferredConfig.tmrPref === "subject") {
        const toAdd: any = [
          ...new Set(
            //@ts-ignore
            timetableData.timetableContent[days[now.curWeekDay + 1]]
          ),
        ].map(
          (cur) =>
            //@ts-ignore
            formattedFormat.classCode[user.preferredConfig.language][cur]
        );

        return res.status(200).json({
          curClass: "FTD",
          nextClass: "FTD",
          format: formattedFormat,
          refresher: refersherData,
          prepType: "subject",
          prep: {
            toAdd: toAdd,
          },
          time: {
            thisClassTime,
            nextClassTime,
          },
        });
      } else {
        return res.status(200).json({
          curClass: "FTD",
          nextClass: "FTD",
          format: formattedFormat,
          refresher: refersherData,
          prepType: "hide",
          time: {
            thisClassTime,
            nextClassTime,
          },
        });
      }
    }
    if (classIndex.classIndex === -70) {
      // console.log(classIndex.nextClassIndex);
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

    const lunchTime =
      // @ts-ignore
      schoolTimetables[`B${timetableData.school}`][0];

    const thisSchoolTimetable =
      //@ts-ignore
      schoolTimetables[timetableData.school];

    // let : string;
    let previousClass: string =
      //@ts-ignore
      timetableData.timetableContent[now.curDay][classIndex.classIndex - 1];

    const nextClassSimpleTime =
      //@ts-ignore
      schoolTimetables[timetableData.school][classIndex.nextClassIndex];

    // const classBeforeLunchName = timetableData.timetableContent[now.curDay]

    let isBeforeLunch = true;
    let beforeLunchTimeClassName: string = "FTD";
    let beforeLunchIndex: number = 0;

    while (isBeforeLunch) {
      const curClassTime =
        // @ts-ignore
        schoolTimetables[timetableData.school][beforeLunchIndex];
      isBeforeLunch =
        // @ts-ignore
        curClassTime < lunchTime;

      // console.log({ lunchTime, curClassTime, isBeforeLunch });

      if (isBeforeLunch) {
        beforeLunchTimeClassName =
          //@ts-ignore
          timetableData.timetableContent[now.curDay][beforeLunchIndex];
      }

      beforeLunchIndex++;

      // console.log({
      //   beforeLunchIndex,
      //   isBeforeLunch,
      //   beforeLunchTimeClassName,
      // });
    }

    // console.log({
    //   now: now.curTime,
    //   lunchTime,
    //   simpleTime: {
    //     thisClassInitialSimpleTime,
    //     nextClassSimpleTime,
    //   },
    //   isBeforeLunch: now.curTime > thisClassInitialSimpleTime,
    //   isClassBeforeLunch:
    //     now.curTime > thisClassInitialSimpleTime && now.curTime < lunchTime,
    // });

    const isClassBeforeLunch = beforeLunchTimeClassName === curClass;

    if (isClassBeforeLunch) {
      nextClass = "LUC";
      nextClassTime = processedTimetableBreakTime[0];
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

    const timetableData = await Timetables.findById(classId);
    if (!timetableData)
      return newError(
        404,
        `Timetable Not Found|Can not find timetable with the ID (${classId})`,
        `user`
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
      if (!user.timetables?.primaryClass) {
        user.preferredConfig.tmrPref =
          timetableData.school === "ASSUMPTION" ? "book" : "hide";
      }
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

    const formattedData: any[] = [];

    starredClasses.forEach((cur) => {
      // @ts-ignore
      const thisClassPrefix: string = classPrefixFormat[cur.program] || "M";

      formattedData.push({
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
      starredClass: formattedData,
    });
  } catch (error) {
    next(error);
  }
};

export const setHoliday: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const { type, name, desc, date, school } = req.body;

    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user)
      return newError(
        404,
        "Critical Error Has Occured|Please contect system administrator immediately. CODE[USR0001]",
        "important"
      );

    if (user.accType !== "developer")
      return newError(
        403,
        "Forbidden|You do not have sufficient rights to access this resource",
        "user"
      );

    const holidayDate = new Date(date);

    const simplifiedDate = `${holidayDate.getDate()}${
      holidayDate.getMonth() + 1
    }${holidayDate.getFullYear()}`;

    const holiday = new Holiday({
      type: type,
      name: {
        TH: name.TH,
        EN: name.EN,
      },
      desc: {
        TH: desc.TH,
        EN: desc.EN,
      },
      date: simplifiedDate,
      school: school,
      addedBy: user._id,
    });

    const saved = await holiday.save();

    res.status(200).json({
      result: saved,
      createdBy: `${user.firstName} ${user.lastName} - ${user.accType}`,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadTimetable: RequestHandler = async (req, res, next) => {
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
    if (!req.file)
      return newError(
        422,
        "Image not found|Timetable Image is require when uploading new timetable."
      );

    const type = req.body.type;

    const classInfo: ClassInfoInterface = {
      classNo: req.body.classNo,
      year: req.body.year,
      school: req.body.school,
      program: req.body.program,
    };

    const existingTimetableRequest = await TimetableRequest.findOne({
      status: "open",
      classInfo: {
        year: classInfo.year,
        classNo: classInfo.classNo,
        school: classInfo.school,
        program: classInfo.program,
      },
    });
    if (existingTimetableRequest)
      return newError(
        409,
        "Request Existed|Thank you for your co-operation but we have already recived a request for this class timetable from another user.",
        "user"
      );

    const newTimetableRequest = new TimetableRequest({
      type: type,
      status: "open",
      classInfo: {
        year: classInfo.year,
        classNo: classInfo.classNo,
        school: classInfo.school,
        program: classInfo.program,
      },
      timetableImagePath: req.file.path,
      uploadedBy: user._id,
    });

    const result = await newTimetableRequest.save();

    return res.status(201).json({
      modal: true,
      header: "Success!",
      message:
        "Your request has been successfully submitted thank you for making Timetable a better tool for everyone.",
    });
  } catch (error) {
    next(error);
  }
};

export const newTimetableTimeLayout: RequestHandler = async (
  req,
  res,
  next
) => {
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

    if (user.accType !== "developer")
      return newError(
        403,
        "Forbidden|You do not have sufficient rights to access this resource",
        "user"
      );

    const timeList: string[] = req.body.timeList;
    const school: AvaliableSchool = req.body.school;
    const program: string = req.body.program;

    const newTimeLayout = new TimeLayout({
      school: school,
      program: program,
      time: timeList,
    });

    const result = await newTimeLayout.save();

    return res.status(201).json({
      modal: true,
      header: "Successfully Created New Time Layout",
      message: `Successfully created new time layout for (${result.program}) of (${result.school})`,
    });
  } catch (error) {
    next(error);
  }
};
