import { RequestHandler } from "express";
import newError from "../helpers/newError";
import User from "../models/authentication/user";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";

export const login: RequestHandler = async (req, res, next) => {
  const email = req.body.email;
  const password = req.boy.password;

  const user = await User.findOne({ email: email });
  if (!user) throw newError(404, "User not found", "user");

  const isValidPassword = await compare(password, user.password);

  if (isValidPassword) throw newError(401, "Incorrect Password");

  const token = sign(
    {
      id: user.id,
      iat: new Date().getTime(),
    },
    process.env.JWT_KEY!,
    {
      issuer: "alt.api",
    }
  );

  return res.status(200).json({
    message: "Success",
  });
};
