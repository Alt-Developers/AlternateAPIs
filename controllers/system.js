const Player = require("../models/player");

exports.getPlayersList = (req, res, next) => {
  console.log("Sever has recived a request for PlayerList");
  Player.find()
    .select("codeName score -_id")
    .then((players) => {
      const playersList = {};
      players.forEach((player) => {
        playersList[player.codeName] = player.score;
      });
      console.log(playersList);
      res.json({
        playersList,
      });
    })
    .catch((err) => {
      next(new Error("Can't connect to the database"));
    });
};

exports.getRealNameList = (req, res, next) => {
  console.log("Sever has recived a request for RealNameList");
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
};

exports.addPlayer = (req, res, next) => {
  const realName = req.body.realName;
  const codeName = req.body.codeName;
  const score = req.body.score;
  const player = new Player({
    realName: realName,
    codeName: codeName,
    score: score,
  });
  player.save();
  res
    .status(201)
    .json({
      message: "Successfuly created a players",
    })
    .catch((err) => {
      next(new Error("Can't connect to the database"));
    });
};

exports.deletePlayer = (req, res, next) => {
  const playerCode = req.params.playerCode;
  Player.findOneAndDelete({ codeName: playerCode }).then((result) => {
    console.log("Deleted a player");
  });
  res
    .status(202)
    .json({
      message: "Successfully deleted a product",
    })
    .catch((err) => {
      next(new Error("Can't connect to the database"));
    });
};
