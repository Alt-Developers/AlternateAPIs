const Player = require("../models/player");
const addCount = require("../util/addCount");
const { validationResult } = require("express-validator");

exports.getPlayerList = (req, res, next) => {
  console.log("a request has arrived at getPlayerList");
  Player.find()
    .select("codeName score -_id")
    .then((players) => {
      const playersList = {};
      players.forEach((player) => {
        playersList[player.codeName] = player.score;
      });
      res.json({
        playersList,
      });
    })
    .catch((err) => {
      next(new Error("Can't connect to the database"));
    });
  addCount("getPlayersList");
  // next(new Error("DUMMY ERROR"));
};

exports.getRealNameList = (req, res, next) => {
  console.log("a request has arrived at getRealNameList");
  Player.find()
    .select("codeName realName -_id")
    .then((players) => {
      const playersList = {};
      players.forEach((player) => {
        playersList[player.codeName] = player.realName;
      });
      res.json({
        playersList,
      });
    })
    .catch((err) => {
      next(new Error("Can't connect to the database"));
    });
  addCount("getRealNameList");
};

exports.addPlayer = (req, res, next) => {
  const realName = req.body.realName;
  const codeName = req.body.codeName;
  const score = req.body.score;
  const errors = validationResult(req);

  if (errors) {
    console.log(errors.array());
    return res.status(422).json({
      message: errors.array()[0].msg,
    });
  }

  Player.findOne({ codeName: codeName })
    .then((player) => {
      if (!player) {
        const player = new Player({
          realName: realName,
          codeName: codeName,
          score: score,
        });
        player.save();
        res.status(201).json({
          message: "Successfully created a players",
          realName: realName,
          codeName: codeName,
          score: score,
        });
      } else {
        res.status(409).json({
          message: "Player codeName already exist!",
        });
      }
    })
    .catch((err) => {
      next(new Error("Can't connect to the database"));
    });
  addCount("addPlayer");
};

exports.deletePlayer = (req, res, next) => {
  const playerCode = req.params.playerCode;
  Player.findOneAndDelete({ codeName: playerCode })
    .then((result) => {
      console.log(result, "Deleted a player");
      if (result) {
        res.status(200).json({
          message: "Successfully deleted a product",
        });
      } else {
        res.status(404).json({
          message: "This player is not exist!",
        });
      }
    })
    .catch((err) => {
      next(new Error("Can't connect to the database"));
    });
  addCount("deletePlayer");
};
