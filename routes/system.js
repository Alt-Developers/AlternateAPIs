const express = require("express");
const systemController = require("../controllers/system");

const router = express.Router();

router.get("/getPlayersList", systemController.getPlayersList);
router.get("/getRealNameList", systemController.getRealNameList);

router.post("/addPlayer", systemController.addPlayer);

router.delete("/deletePlayer/:playerCode", systemController.deletePlayer);

module.exports = router;
