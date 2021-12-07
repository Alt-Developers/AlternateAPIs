import { Router } from "express";
import * as systemController from "../controllers/system";

const router = Router();

router.get("/getPlayersList", systemController.getPlayersList);
router.get("/getRealNameList", systemController.getRealNameList);
router.post("/addPlayer", systemController.addPlayer);
router.delete("/deletePlayer/:playerCode", systemController.getPlayersList);

export default router;
