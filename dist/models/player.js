"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const playerSchema = new mongoose_1.Schema({
    realName: {
        type: String,
        required: true,
    },
    codeName: {
        type: String,
        minlength: 3,
        maxlength: 3,
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
});
const system13Db = mongoose_1.connection.useDb("system13");
exports.default = system13Db.model("Player", playerSchema);
