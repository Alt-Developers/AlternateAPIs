import { Router } from "express";
import { body, validationResult } from "express-validator";
import * as timetablesController from "../controllers/Oldtimetables";
import { programTypes } from "../models/oldtimetables/data";
import dCrypt from "../middleware/isAuth";

const router = Router();
const programList = Object.keys(programTypes);
const supportedSchool = ["NEWTON", "ESSENCE", "ASSUMPTION"];

router.get("/getUser", dCrypt, timetablesController.getUser);
router.get("/getTimetable", dCrypt, timetablesController.getTimetable);
router.get("/getGlance", timetablesController.getGlance);
router.get("/getCode", timetablesController.getCode);
router.get("/socketRefresh", timetablesController.socketRefresh);
router.get("/getNotUserClass", dCrypt, timetablesController.getNotUserClass);

router.post(
  "/registerUserClass",
  dCrypt,
  [
    body("classNo", "Must include classNo.").notEmpty(),
    body("program", "Invalid Program.")
      .notEmpty()
      .custom((value, { req }) => {
        let validationErr = false;
        if (!programList.includes(value)) {
          validationErr = true;
        }
        if (!validationErr) {
          return Promise.resolve();
        }
        return Promise.reject(
          "Program does not exist. there's bell, english, chinese, mathScience, digitalTechnology and gifted"
        );
      }),
    body("school")
      .notEmpty()
      .custom((value) => {
        if (!supportedSchool.includes(value)) {
          return Promise.reject(
            "School is not supported / Not Found|We only support The Newton, The Essence and Assumption College"
          );
        } else {
          return Promise.resolve();
        }
      }),
  ],
  timetablesController.registerUserClass
);

router.post(
  "/createTimetable",
  dCrypt,
  [
    body("classNo", "ClassNo must not be empty.").notEmpty(),
    body("program")
      .notEmpty()
      .withMessage("Program must not be empty.")
      .custom((value) => {
        if (!programList.includes(value)) {
          return Promise.reject(
            `Program does not exist. please select between ${programList.flat()}`
          );
        } else return Promise.resolve();
      }),
    body("school")
      .notEmpty()
      .custom((value) => {
        if (!supportedSchool.includes(value)) {
          return Promise.reject(
            "School is not supported / Not Found|We only support The Newton, The Essence and Assumption College"
          );
        } else {
          return Promise.resolve();
        }
      }),
    body(
      "color",
      "Invalid Color|Color Must be filled and need to be HEX Color."
    )
      .notEmpty()
      .isHexColor(),
    body(
      "content",
      "Timetable Content Not Found|Timetable content must be filled to create a timetables."
    ).notEmpty(),
  ],
  timetablesController.createTimetable
);

router.post(
  "/removeRegisteredClass",
  dCrypt,
  [
    body("classNo", "ClassNo must be filled.").notEmpty(),
    body("program", "program must be 4 letter long.")
      .notEmpty()
      .toUpperCase()
      .isLength({ min: 4, max: 4 }),
  ],
  timetablesController.removeClassFromUser
);

router.post(
  "/newProgram",
  [
    body("school").custom((value) => {
      if (!supportedSchool.includes(value)) {
        return Promise.reject(
          "School is not supported / Not Found|We only support The Newton, The Essence and Assumption College"
        );
      } else {
        return Promise.resolve();
      }
    }),
    body("program").custom((value) => {
      if (!programList.includes(value)) {
        return Promise.reject(
          `Program is not Supported / Not Found|We only support ${programList.flat()}`
        );
      } else {
        return Promise.resolve();
      }
    }),
  ],
  timetablesController.newProgram
);
// router.post("/newUniversalClass", timetablesController.newUniversalClass);

export default router;
