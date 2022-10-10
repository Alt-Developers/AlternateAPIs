import { RequestHandler } from "express";
import newError from "../helpers/newError";
import User from "../models/authentication/user";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";

export const login: RequestHandler = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email });
    if (!user) throw newError(404, "User not found", "user");

    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) throw newError(401, "Incorrect Password");

    const token = sign(
      {
        id: user.id,
        iat: new Date().getTime(),
      },
      process.env.JWT_KEY!,
      {
        issuer: "alt.apis",
      }
    );

    return res.status(200).json({
      message: "Success",
      token: token,
      accType: user.accType,
    });
  } catch (err) {
    next(err);
  }
};

const allowedService = ["timetables"];
export const decodeToken: RequestHandler = (req, res, next) => {
  const service = req.query.service?.toString() ?? "";

  const respond = {
    base: {
      name: req.user.name,
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar,
      accType: req.user.accType,
    },
  };

  if (service === "timetables") {
    respond["timetables"] = {
      primaryClass: req.user.timetables.primaryClass,
      starred: req.user.timetables.starred,
      modalId: req.user.timetables.modalId ?? false,
    };
  }

  res.status(201).json(respond);
};
