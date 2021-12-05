"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler500 = exports.notFound404 = void 0;
const notFound404 = (req, res, next) => {
    res.status(404).json({
        message: "Not found",
        requestedProduct: req.path,
    });
};
exports.notFound404 = notFound404;
const errorHandler500 = (err, req, res, next) => {
    console.log("an error has occurred");
    res.status(500).json({
        message: "This error has been send from the central error handler",
        cause: err,
    });
};
exports.errorHandler500 = errorHandler500;
