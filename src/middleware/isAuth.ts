import env from "dotenv";
import { RequestHandler } from "express";
import { ErrorInterface } from "../models/types";
import jwt from "jsonwebtoken";

const dCrypt: RequestHandler = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error: ErrorInterface = new Error("Token not found.");
    error.statusCode = 400;
    throw error;
  }
  req.authToken = req.get("Authorization")!.split(" ")[1];
  const token = req.get("Authorization")!.split(" ")[1];
  let decodedToken: any;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_KEY!);
  } catch (err: any) {
    if (err) {
      err.statusCode = 500;
      throw err;
    }
  }

  if (!decodedToken) {
    const error: ErrorInterface = new Error("Not Authenticated.");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};

export default dCrypt;
