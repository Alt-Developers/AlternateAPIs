import { RequestHandler } from "express";
import newError from "./newError";
import { verify } from "jsonwebtoken";
import User from "../models/authentication/user";

const verifyToken: RequestHandler = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) throw newError(400, "Token not found");
    if (!token.startsWith("Bearer"))
      throw newError(400, "Auth Header is invalid");

    let verified: { id: string; iat: number; iss: string };
    try {
      // @ts-ignore
      verified = verify(token.split(" ")[1], process.env.JWT_KEY!);
    } catch (err) {
      throw newError(400, "Token is invalid");
    }
    if (verified.iss !== "alt.apis")
      throw newError(401, "Unknown Token Issuer");

    const user = await User.findOne({ _id: verified.id, status: "active" });
    if (!user) throw newError(404, "User not Found");

    if (new Date(user.passwordLastChanged).getTime() > verified.iat)
      throw newError(401, "Password has been changed");

    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
};

export default verifyToken;
