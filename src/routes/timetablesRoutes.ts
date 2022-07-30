import { Router } from "express";
import { newTimetable } from "../controllers/timetables";

const router = Router();

router.post("/newTimetable", newTimetable);

export default router;
