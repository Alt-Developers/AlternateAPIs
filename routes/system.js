const express = require("express");
const systemController = require("../controllers/system");
const { body } = require("express-validator");

const router = express.Router();

router.get("/getPlayersList", systemController.getPlayersList);
router.get("/getRealNameList", systemController.getRealNameList);

router.post(
  "/addPlayer",
  [
    body("codeName", "codeName is invalid").isAlphanumeric().toUpperCase(),
    body("realName", "realName is Invalid").isAlphanumeric(),
    body("score", "Score is not a number").isNumeric(),
  ],
  systemController.addPlayer
);

router.delete("/deletePlayer/:playerCode", systemController.deletePlayer);

module.exports = router;
