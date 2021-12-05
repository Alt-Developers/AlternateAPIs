"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const errors_1 = require("./controllers/errors");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use("/system");
app.use("/");
app.use(errors_1.errorHandler500);
mongoose_1.default
    .connect("mongodb+srv://api:rQJ2H3ze3VTfwlef@cluster0.ncvvz.mongodb.net/system13?retryWrites=true&w=majority")
    .then((result) => {
    console.log("Connected to the database");
    app.listen(80);
});
