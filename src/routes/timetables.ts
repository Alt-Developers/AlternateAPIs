import { Router } from "express";
import { body } from "express-validator";
import * as systemController from "../controllers/newTimetable";
import dCrypt from "../middleware/isAuth";

const router = Router();

router.get("/getFormat", systemController.getFormat);
router.get("/getClassFromSchool", dCrypt, systemController.getClassFromSchool);
router.get("/getTimetable/:classId", dCrypt, systemController.getTimetable);
router.get("/getGlance", dCrypt, systemController.getGlance);
router.get("/getMyClass", dCrypt, systemController.getMyClass);

router.post("/newTimetable", dCrypt, systemController.newTimetable);
router.post("/newFormat", dCrypt, systemController.newFormat);
router.post(
  "/registerUserClass",
  dCrypt,
  [
    body(
      "classId",
      "ClassId is Requried|System need class Id to add the class"
    ).notEmpty(),
  ],
  systemController.registerUserClass
);
router.post("/removeUserClass", dCrypt, systemController.removeClassFromUser);
router.post("/setNewHoliday", dCrypt, systemController.setHoliday);

router.post("/uploadTimetable", dCrypt, systemController.uploadTimetable);
router.post(
  "/newTimetableTimeLayout",
  dCrypt,
  systemController.newTimetableTimeLayout
);

export default router;
