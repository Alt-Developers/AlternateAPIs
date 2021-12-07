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
const system_1 = __importDefault(require("./routes/system"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use("/auth", auth_1.default);
app.use("/system13", system_1.default);
app.use("/", errors_1.notFound404);
app.use(errors_1.errorHandler500);
mongoose_1.default.connect("mongodb+srv://api:rQJ2H3ze3VTfwlef@cluster0.ncvvz.mongodb.net/");
const db = mongoose_1.default.connection;
db.once("open", () => {
    console.log("Connected to the database");
    app.listen(80);
});
// .then((result) => {
//   console.log("Connected to the database");
// });
