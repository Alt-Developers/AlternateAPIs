import express, { RequestHandler } from "express";
import {
  ErrorInterface,
  ErrorRequestHandler,
  Middleware,
} from "../models/types";

export const notFound404: RequestHandler = (req, res, next) => {
  res.status(404).json({
    message: "SS APIs can't seem to find service you requested.",
    requestedService: req.path,
  });
};

export const errorHandler500: ErrorRequestHandler = (err, req, res, next) => {
  console.log("an error has occurred", { err });
  res.status(500).json({
    message: "Server Side Error Has Occurred!",
    cause: err,
  });
};

export const errorHandler418: RequestHandler = (req, res, next) => {
  res.status(418).json({
    message: "I refuse to brew a coffee with a teapot!",
  });
};

export const centralError: ErrorRequestHandler = (
  err: ErrorInterface,
  req,
  res,
  next
) => {
  const code = err.statusCode || 500;
  res.status(code).json({
    error: err.message,
    message: "an error has occurred",
  });
};
