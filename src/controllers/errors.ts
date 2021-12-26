import express, { RequestHandler } from "express";
import {
  ErrorInterface,
  ErrorRequestHandler,
  Middleware,
} from "../models/types";

export const notFound404: RequestHandler = (req, res, next) => {
  res.status(404).json({
    message: "SS APIs can't find service you have requested.",
    requestedService: req.path,
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
