import express, { RequestHandler } from "express";
import { ErrorRequestHandler, Middleware } from "../models/types/modelType";
import { deleteFile } from "../utilities/fileHelper";

export const notFound404: RequestHandler = (req, res, next) => {
  res.status(404).json({
    message: "SS APIs can't find service you have requested.",
    requestedService: req.path,
  });
};

export const centralError: ErrorRequestHandler = (
  err: Error,
  req,
  res,
  next
) => {
  const code = err.statusCode || 500;
  console.log(`${err.statusCode} - ${err.message}`);

  if (req.file) deleteFile(req.file.path);

  console.log(err);

  res.status(code).json({
    type: err.type || "general",
    modal: err.modal,
    location: err.location,
    message: err.message.split("|")[1] || err.message,
    header: err.message.split("|")[1] ? err.message.split("|")[0] : undefined,
  });
};
