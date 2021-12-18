import express from "express";
import Player from "../models/player";
import { ErrorInterface, Middleware, PlayerInterface } from "../models/types";
import addCount from "../utilities/addCount";
import { validationResult } from "express-validator";
import User from "../models/user";
import user from "../models/user";

export const getPlayersList: Middleware = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      const error: ErrorInterface = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const players = await Player.find({ createdBy: user._id }).select(
      "codeName score -_id"
    );

    const playersList: any = {};
    players.forEach((player: PlayerInterface) => {
      const key: string = player.codeName;
      playersList[key] = player.score;
    });
    res.json({
      playersList,
    });
  } catch (err) {
    next(new Error("Can't connect to the database"));
  }
  addCount("getPlayersList");
};

export const getRealNameList: Middleware = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);

    if (!user) {
      const error: ErrorInterface = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const players = await Player.find({ createdBy: userId }).select(
      "codeName realName -_id"
    );

    const playersList: any = {};
    players.forEach((player) => {
      const key: string = player.codeName;
      playersList[key] = player.realName;
    });
    res.json({
      playersList,
    });
  } catch (err) {
    next(err);
  }
  addCount("getRealNameList");
};

export const addPlayer: Middleware = async (req, res, next) => {
  const userId = req.userId;
  const realName = req.body.realName;
  const codeName = req.body.codeName;
  const score = req.body.score;
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).json({
        message: errors.array()[0].msg,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      const error: ErrorInterface = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const player = await Player.findOne({ codeName: codeName });
    if (!player) {
      const player = new Player({
        realName: realName,
        codeName: codeName,
        createdBy: user._id,
        score: score,
      });
      await player.save();
      res.status(201).json({
        message: "Successfully created a players",
        realName: realName,
        codeName: codeName,
        createdBy: user._id,
        score: score,
      });
    } else {
      res.status(409).json({
        message: "Player codeName already exist!",
      });
    }
    addCount("addPlayer");
  } catch (err) {
    next(new Error("Can't connect to the database"));
  }
};

export const deletePlayer: Middleware = async (req, res, next) => {
  try {
    const userId = req.userId;
    const playerCode = req.params.playerCode;

    const player = await Player.findById({ codeName: playerCode });

    if (!player) {
      const error: ErrorInterface = new Error("Player not found");
      error.statusCode = 404;
      throw error;
    }

    if (player.createdBy.toString() !== userId.toString()) {
      const error: ErrorInterface = new Error("Not Authorized / Forbidden");
      error.statusCode = 403;
      throw error;
    }

    const result = await Player.findOneAndDelete({ codeName: playerCode });

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
    addCount("deletePlayer");
  } catch (err) {
    next(new Error("Can't connect to the database"));
  }
};
