import { Router } from "express";
import * as systemController from "../controllers/system";
import dCrypt from "../middleware/isAuth";

const router = Router();

router.get("/getPlayersList", dCrypt, systemController.getPlayersList);
router.get("/getRealNameList", dCrypt, systemController.getRealNameList);
router.post("/addPlayer", dCrypt, systemController.addPlayer);
router.delete("/deletePlayer/:playerId", dCrypt, systemController.deletePlayer);

router.get("/getUserPlayer", dCrypt, systemController.getUserPlayer);

export default router;
