import { Router } from "express";
import * as legalController from "../controllers/legal";
import dCrypt from "../middleware/isAuth";

const router = Router();

router.get("/getLicense/:code", legalController.getLicense);

export default router;
