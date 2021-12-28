import env from "dotenv";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import newError from "../utilities/newError";

const dCrypt: RequestHandler = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) return newError(400, "Token not found.");
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

  if (!decodedToken) return newError(401, "Not Authenticated.");
  req.userId = decodedToken.userId;
  next();
};

export default dCrypt;
