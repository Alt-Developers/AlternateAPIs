import { Router } from "express";
import { body } from "express-validator";
import * as timetablesController from "../controllers/timetables";
import { programTypes } from "../models/ss_timetables/data";
import dCrypt from "../middleware/isAuth";

const router = Router();
const programList = Object.keys(programTypes);

router.get("/getUser", dCrypt, timetablesController.getUser);
router.get("/getTimetable", dCrypt, timetablesController.getTimetable);

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
            "Program does not exist. there's bell, english, chinese, mathScience, digitalTechnology and gifted"
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

export default router;
