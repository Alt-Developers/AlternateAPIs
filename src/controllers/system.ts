import express, { RequestHandler } from "express";
import Player from "../models/system13/player";
import { Middleware, PlayerInterface } from "../models/types";
import addCount from "../utilities/addCount";
import { validationResult } from "express-validator";
import User from "../models/ss_Account/user";
import newError from "../utilities/newError";

export const getPlayersList: Middleware = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) return newError(404, "User not found.");

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
    next(err);
  }
  addCount("getPlayersList");
};

export const getRealNameList: Middleware = async (req, res, next) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);

    if (!user) return newError(404, "User not found.");

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

    if (!user) return newError(404, "User not found.");

    const player = await Player.findOne({ codeName: codeName });

    if (player) {
      if (player?.createdBy.toString() === user._id.toString()) {
        return newError(
          409,
          "This player codename already existed on this account."
        );
      }
    }

    const newPlayer = new Player({
      realName: realName,
      codeName: codeName,
      createdBy: user._id,
      score: score,
    });
    const result = await newPlayer.save();

    user.system13?.push(result._id);
    user.save();
    res.status(201).json({
      message: "Successfully created a players",
      realName: realName,
      codeName: codeName,
      createdBy: user._id,
      score: score,
    });

    addCount("addPlayer");
  } catch (err) {
    next(err);
  }
};

export const deletePlayer: Middleware = async (req, res, next) => {
  try {
    const userId = req.userId;
    const playerId = req.params.playerId;

    const player = await Player.findById(playerId);

    const user = await User.findById(userId);

    if (!player || !user) return newError(404, "User / Player not found");

    if (player.createdBy.toString() !== user._id.toString())
      return newError(403, "Not Authorized / Forbidden");

    const filtered = user.system13?.filter(
      (id) => id.toString() !== playerId.toString()
    );

    user.system13 = filtered;

    user.save();

    const result = await Player.findByIdAndDelete(playerId);

    console.log(result, "Deleted a player");
    if (result) {
      res.status(200).json({
        message: "Successfully deleted a product",
      });
    } else return newError(500, "Something went wrong.");

    addCount("deletePlayer");
  } catch (err) {
    next(err);
  }
};

export const getUserPlayer: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return newError(404, "User not found.");
    const populatedUser = await User.findById(userId).populate(
      "system13",
      "",
      Player
    );
    const playersList: any = populatedUser.system13;

    const userPlayer: any[] = [];
    playersList.forEach((cur: any) => {
      userPlayer.push({
        _id: cur._id,
        realName: cur.realName,
        codeName: cur.codeName,
        score: cur.score,
      });
    });
    res.json({
      userPlayer,
    });
  } catch (err) {
    next(err);
  }
};
