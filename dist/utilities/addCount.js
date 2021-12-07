"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const count_1 = __importDefault(require("../models/count"));
function addCount(apiName) {
    count_1.default.findOne({ apiName: apiName }).then((api) => {
        if (api) {
            api.count += 1;
            return api.save();
        }
        const newApi = new count_1.default({
            apiName: apiName,
            count: 1,
        });
        return newApi.save();
    });
}
exports.default = addCount;
