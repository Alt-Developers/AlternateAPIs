"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlayer = exports.addPlayer = exports.getRealNameList = exports.getPlayersList = void 0;
const player_1 = __importDefault(require("../models/player"));
const addCount_1 = __importDefault(require("../utilities/addCount"));
const express_validator_1 = require("express-validator");
const getPlayersList = (req, res, next) => {
    player_1.default.find()
        .select("codeName score -_id")
        .then((players) => {
        const playersList = {};
        players.forEach((player) => {
            const key = player.codeName;
            playersList[key] = player.score;
        });
        res.json({
            playersList,
        });
    })
        .catch((err) => {
        next(new Error("Can't connect to the database"));
    });
    (0, addCount_1.default)("getPlayersList");
};
exports.getPlayersList = getPlayersList;
const getRealNameList = (req, res, next) => {
    player_1.default.find()
        .select("codeName realName -_id")
        .then((players) => {
        const playersList = {};
        players.forEach((player) => {
            const key = player.codeName;
            playersList[key] = player.realName;
        });
        res.json({
            playersList,
        });
    })
        .catch((err) => {
        next(new Error("Can't connect to the database"));
    });
    (0, addCount_1.default)("getRealNameList");
};
exports.getRealNameList = getRealNameList;
const addPlayer = (req, res, next) => {
    const realName = req.body.realName;
    const codeName = req.body.codeName;
    const score = req.body.score;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).json({
            message: errors.array()[0].msg,
        });
    }
    player_1.default.findOne({ codeName: codeName })
        .then((player) => {
        if (!player) {
            const player = new player_1.default({
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
        }
        else {
            res.status(409).json({
                message: "Player codeName already exist!",
            });
        }
    })
        .catch((err) => {
        next(new Error("Can't connect to the database"));
    });
    (0, addCount_1.default)("addPlayer");
};
exports.addPlayer = addPlayer;
const deletePlayer = (req, res, next) => {
    const playerCode = req.params.playerCode;
    player_1.default.findOneAndDelete({ codeName: playerCode })
        .then((result) => {
        console.log(result, "Deleted a player");
        if (result) {
            res.status(200).json({
                message: "Successfully deleted a product",
            });
        }
        else {
            res.status(404).json({
                message: "This player is not exist!",
            });
        }
    })
        .catch((err) => {
        next(new Error("Can't connect to the database"));
    });
    (0, addCount_1.default)("deletePlayer");
};
exports.deletePlayer = deletePlayer;
