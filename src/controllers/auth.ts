import { RequestHandler } from "express";
import newError from "../helpers/newError";
import User from "../models/authentication/user";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { sentTokenEmail } from "../helpers/email";

export const login: RequestHandler = async (req, res, next) => {
  try {
    const identifier = req.body.identifier;
    const password = req.body.password;

    if (!identifier || !password)
      throw newError(400, "Missing required arguments");

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
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
export const decodeToken: RequestHandler = async (req, res, next) => {
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
    if (!req.user.timetables) {
      respond["timetable"] = false;
    } else {
      respond["timetables"] = {
        primaryClass: req.user.timetables.primaryClass,
        starred: req.user.timetables.starred,
        modalId: req.user.timetables.modalId ?? false,
      };
    }
  }

  res.status(201).json(respond);
};

export const fotgetPassword: RequestHandler = async (req, res, next) => {
  try {
    if (!req.query.email) next();

    const user = await User.findOne({
      email: req.query.email,
      status: "active",
    });
    if (!user) throw newError(404, "User not found");

    const token = uuidv4();
    user.passwordR = { token, exp: new Date(Date.now() + 7200000) };

    await user.save();

    sentTokenEmail(user.email, user.name, token);

    return res.status(201).json({
      message: "Success!",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPasswordToken: RequestHandler = async (req, res, next) => {
  try {
    if (!req.query.token)
      throw newError(
        400,
        "Both Token and Email are not present in the request"
      );

    const user = await User.findOne({
      "passwordR.token": req.query.token,
      status: "active",
    });
    console.log(user);
    if (!user) throw newError(400, "Invalid Token");
    if (!user.passwordR) throw newError(500, "Something went wrong");

    if (Date.now() > user.passwordR.exp.getTime()) {
      user.passwordR = undefined;
      await user.save();
      throw newError(401, "Token Expried (2 hrs.)");
    }
    return res.status(201).json({
      base: {
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        accType: user.accType,
      },
    });
  } catch (error) {
    next(error);
  }
};

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/i;
export const changePassWithToken: RequestHandler = async (req, res, next) => {
  try {
    const token = req.body.token;
    const password = req.body.password;
    const cpassword = req.body.cpassword;

    if (!token) throw newError(400, "Missing required arguments");

    if (password !== cpassword)
      throw newError(400, "Confirm password does not match");

    if (!passwordRegex.test(password))
      throw newError(400, "Password does not match the specification");

    const user = await User.findOne({
      "passwordR.token": token,
      status: "active",
    });
    if (!user) throw newError(400, "Invalid Token");

    const newPassword = await hash(password, 12);

    user.password = newPassword;
    user.passwordLastChanged = new Date();
    user.passwordR = undefined;

    await user.save();

    const jwt = sign(
      {
        id: user.id,
        iat: new Date().getTime() + 100,
      },
      process.env.JWT_KEY!,
      {
        issuer: "alt.apis",
      }
    );

    return res.status(201).json({
      message: "Success!",
      token: jwt,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassWithPassword: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    const cNewPassword = req.body.cNewPassword;

    if (!password || !newPassword || !cNewPassword)
      throw newError(400, "Missing required arguments");

    if (newPassword !== cNewPassword)
      throw newError(400, "Confirm password does not match");

    if (!passwordRegex.test(password))
      throw newError(400, "Password does not match the specification");

    const isValidPassword = await compare(password, req.user.password);
    if (!isValidPassword) throw newError(401, "Incorrect Password");

    const hashedPassword = await hash(newPassword, 12);
    req.user.password = hashedPassword;

    await req.user.save();

    return res.status(200).json({
      message: "Succuess!",
      username: req.user.username,
      email: req.user.email,
    });
  } catch (error) {
    next(error);
  }
};

export const signup: RequestHandler = async (req, res, next) => {
  try {
    const { username, name, email, password, cpassword } = req.body;
    const avatar = req.file?.path ?? "/images/default.png";

    if (!name || !username || !email || !password || !cpassword)
      throw newError(400, "Missing Required Data");

    if (password !== cpassword)
      throw newError(400, "Confirm password does not match");

    if (!passwordRegex.test(password))
      throw newError(400, "Password does not match the specification");

    const findUser = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });
    if (findUser) {
      if (findUser.email === email)
        throw newError(409, "Email is already taken");
      if (findUser.username === username)
        throw newError(409, "Username already taken");
      throw newError(500, "Something went wrong");
    }

    const hashedPassword = await hash(password, 12);

    const newUser = new User({
      accType: "user",
      name,
      username,
      email,
      password: hashedPassword,
      avatar,
      status: "active",
    });

    const user = await newUser.save();

    return res.status(201).json({
      message: "Successfully created a user",
      id: user._id,
    });
  } catch (error) {
    next(error);
  }
};
