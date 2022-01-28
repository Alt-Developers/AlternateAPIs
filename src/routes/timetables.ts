import { Router } from "express";
import { body } from "express-validator";
import * as timetablesController from "../controllers/timetables";
import { programTypes } from "../models/ss_timetables/data";
import dCrypt from "../middleware/isAuth";

const router = Router();
const programList = Object.keys(programTypes);

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
    body("color", "You must fill the color and it must be HEX color")
      .notEmpty()
      .isHexColor(),
    body("content", "Content must not be empty.").notEmpty(),
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

// router.post("/newProgram", timetablesController.newProgram);
// router.post("/newUniversalClass", timetablesController.newUniversalClass);

export default router;
