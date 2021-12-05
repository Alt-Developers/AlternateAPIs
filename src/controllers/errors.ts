import express from "express";
import { ErrorRequestHandler, Middleware } from "../models/types";

export const notFound404: Middleware = (req, res, next) => {
  res.status(404).json({
    message: "Not found",
    requestedProduct: req.path,
  });
};

export const errorHandler500: ErrorRequestHandler = (err, req, res, next) => {
  console.log("an error has occurred");
  res.status(500).json({
    message: "This error has been send from the central error handler",
    cause: err,
  });
};
