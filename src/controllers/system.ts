import express from "express";
import Player from "../models/player";
import { Middleware, Player as playerTypes } from "../models/types";
import addCount from "../utilities/addCount";
import { validationResult } from "express-validator";

export const getPlayersList: Middleware = (req, res, next) => {
  Player.find()
    .select("codeName score -_id")
    .then((players) => {
      const playersList: any = {};
      players.forEach((player: playerTypes) => {
        const key: string = player.codeName;
        playersList[key] = player.score;
      });
      res.json({
        playersList,
      });
    })
    .catch((err) => {
      next(new Error("Can't connect to the database"));
    });
  addCount("getPlayersList");
};

export const getRealNameList: Middleware = (req, res, next) => {
  Player.find()
    .select("codeName realName -_id")
    .then((players) => {
      const playersList: any = {};
      players.forEach((player) => {
        const key: string = player.codeName;
        playersList[key] = player.realName;
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

export const addPlayer: Middleware = (req, res, next) => {
  const realName = req.body.realName;
  const codeName = req.body.codeName;
  const score = req.body.score;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
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

export const deletePlayer: Middleware = (req, res, next) => {
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
