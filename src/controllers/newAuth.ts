import env from "dotenv";
import { RequestHandler } from "express";
import { UnlockedObjectInterface, UserInterface } from "../models/types";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/ss_Account/user";
import { deleteFile } from "../utilities/fileHelper";
import jwt from "jsonwebtoken";
import newError from "../utilities/newError";
// import newAvatar from "../utilities/newAvatar";

export const login: RequestHandler = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.pass;

  let loadedUser: any;

  User.findOne({ email: email })
    .then((user) => {
      loadedUser = user;
      if (!user) return newError(401, "User with this email not found.");
      return bcrypt.compare(password, user.password);
    })
    .then((isCorrect) => {
      if (!isCorrect) return newError(401, "Wrong Password.");

      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id,
        },
        process.env.JWT_KEY!
      );
      res.status(200).json({
        token: token,
        firstName: loadedUser.firstName,
        lastName: loadedUser.lastName,
        email: loadedUser.email,
        img: loadedUser.avatar,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

export const signup: RequestHandler = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.pass;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const errors = validationResult(req);
  let avatarPath: string;
  let defaultOrNot: boolean;

  if (!req.file) {
    // avatarPath = newAvatar(firstName, lastName);
    avatarPath = "images/default.png";
    defaultOrNot = true;
  } else if (req.file) {
    avatarPath = req.file?.path.replace("\\", "/");
    defaultOrNot = false;
  }

  if (!email || !password || !firstName || !lastName) {
    const err: Error = new Error("Not all field were filled");
    err.statusCode = 422;
    if (!defaultOrNot!) {
      deleteFile(avatarPath!);
    }
    throw err;
  }
  if (!errors.isEmpty()) {
    const err: Error = new Error(
      `Validation Error(s) : ${errors.array()[0].msg}`
    );
    if (!defaultOrNot!) {
      deleteFile(avatarPath!);
    }
    err.statusCode = 422;
    throw err;
  }

  User.findOne({ email: email })
    .then((account) => {
      if (account) return newError(409, "Email already existed.");
      return;
    })
    .then((user) => {
      bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            firstName: firstName,
            lastName: lastName,
            password: hashedPassword,
            email: email,
            avatar: avatarPath,
          });
          console.log(user);
          user.save();
          return res.status(201).json({ message: "Complete", user: user });
        })
        .catch((err: Error) => {
          throw err;
        });
    })
    .catch((err: Error) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      if (!defaultOrNot!) {
        deleteFile(avatarPath!);
      }
      next(err);
    });
};

export const getUserData: RequestHandler = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      if (!user) return newError(404, "User not found.");
      return res.status(200).json({
        token: req.authToken,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        img: user.avatar,
      });
    })
    .catch((err) => {
      next(err);
    });
};

export const postEditProfilePicture: RequestHandler = (req, res, next) => {
  const userId = req.userId;
  const filePath = req.file?.path.replace("\\", "/");
  if (!filePath)
    return newError(
      400,
      "Can't change profile picture if there's no photo attached."
    );
  User.findById(userId)
    .then((user) => {
      if (!user) return newError(404, "User not found.");
      deleteFile(user.avatar);
      user.avatar = filePath;
      user.save();
    })
    .then(() => {
      res.status(201).json({
        message: "Successfully edited user's profile picture.",
      });
    })
    .catch((err) => {
      next(err);
    });
};
