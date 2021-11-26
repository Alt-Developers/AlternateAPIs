const express = require("express");
const apiController = require("../controllers/api");

const router = express.Router();

router.get("/", apiController.index);

router.post("/add-player", apiController.addPlayer);

module.exports = router;
