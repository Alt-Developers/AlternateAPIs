"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const countSchema = new mongoose_1.Schema({
    apiName: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        required: true,
    },
});
const system13Db = mongoose_1.connection.useDb("system13");
exports.default = system13Db.model("Count", countSchema);
