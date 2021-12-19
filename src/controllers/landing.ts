import express, { RequestHandler } from "express";

export const landing: RequestHandler = (req, res, next) => {
  console.log("Hello");
  next();
};
