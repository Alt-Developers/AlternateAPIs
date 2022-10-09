import express, { ErrorRequestHandler, RequestHandler } from "express";
import deleteFile from "../helpers/deleteFile";

export const notFound404: RequestHandler = (req, res, next) => {
  res.status(404).json({
    message: "Alternate APIs can't find service you have requested.",
    requestedService: req.path,
  });
};

export const centralError: ErrorRequestHandler = (err, req, res, next) => {
  const code = err.statusCode || 500;
  console.log(`${err.statusCode} - ${err.message}`);

  if (req.file) deleteFile(req.file.path);

  res.status(code).json({
    type: err.type || "general",
    modal: err.modal,
    location: err.location,
    message: err.message,
  });
};
