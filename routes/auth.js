const express = require("express");
const authController = require("../controllers/auth");
const { body } = require("express-validator");

const router = express.Router();

router.post("/login", authController.login);

module.exports = router;
