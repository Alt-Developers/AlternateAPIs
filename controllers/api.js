const Player = require("../models/player");

exports.index = (req, res, next) => {
  res.send("Hello");
};

exports.addPlayer = (req, res, next) => {
  const playerName = req.body.name;
  const playerCode = req.body.code;
  const playerScore = req.body.score;
  const player = new Player({
    name: playerName,
    code: playerCode,
    score: playerScore,
  });
  player.save();
};

exports.getPlayerScore = (req, res, next) => {};
