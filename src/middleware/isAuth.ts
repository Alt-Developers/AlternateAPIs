import env from "dotenv";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import User from "../models/authentication/user";
import newError from "../utilities/newError";

const dCrypt: RequestHandler = async (req, res, next) => {
  try {
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

    console.log(decodedToken);

    if (!decodedToken) return newError(401, "Not Authenticated.");
    req.userId = decodedToken.userId;

    const user = await User.findById(decodedToken.userId);
    if (!user)
      return newError(
        404,
        "Critical Error Has Occured|Please contect system administrator immediately. CODE[USR0001]",
        "important"
      );
    if (!user.status)
      return newError(
        401,
        "Account is unavaliable|Due to suspension this account's data will not be processed.",
        "important"
      );

    if (user.passwordChangedAt) {
      console.log({
        iat: new Date(decodedToken.iat),
        passwordUser: user.passwordChangedAt,
      });
      if (new Date(user.passwordChangedAt).getTime() > decodedToken.iat) {
        return newError(
          401,
          "Token Invalid|Please login again. CODE[USR0002]",
          "user"
        );
      }
    }

    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
};

export default dCrypt;
