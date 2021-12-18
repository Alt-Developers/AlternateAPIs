import express, { RequestHandler } from "express";

export const landing: RequestHandler = (req, res, next) => {
  res.json({
    message: `Welcome to SS APIs to get started please specify service in the url`,
    example: `https://apis.ssdevelopers.xyz/:service`,
  });
};
