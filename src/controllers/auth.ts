import { RequestHandler } from "express";
import { ErrorInterface } from "../models/types";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/user";
import { deleteFile } from "../utilities/fileHelper";

export const login: RequestHandler = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.pass;
  if (email && password) {
    return res.status(200).json({
      status: "LOGGEDIN",
      firstName: "Prawich",
      lastName: "Thawansakdivudhi",
      email: "prawich.th@gmail.com",
      img: "https://s.isanook.com/ga/0/rp/r/w728/ya0xa0m1w0/aHR0cHM6Ly9zLmlzYW5vb2suY29tL2dhLzAvdWQvMjIxLzExMDY5MzcvMTEwNjkzNy10aHVtYm5haWwuanBn.jpg",
      bio: "I'm prawich!",
    });
  }
  const error: ErrorInterface = new Error("No account found!");
  error.statusCode = 401;
  next(error);
};

export const signup: RequestHandler = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.pass;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const avatarPath = req.file?.path;
  const errors = validationResult(req);

  if (!email || !password || !firstName || !lastName) {
    const err: ErrorInterface = new Error("Not all field were filled");
    err.statusCode = 422;
    deleteFile(avatarPath!);
    return next(err);
  }
  if (!errors.isEmpty()) {
    const err: ErrorInterface = new Error(
      `Validation Error(s) : ${errors.array()[0].msg}`
    );
    deleteFile(avatarPath!);
    err.statusCode = 422;
    return next(err);
  }

  User.findOne({ email: email })
    .then((account) => {
      if (account) {
        const error: ErrorInterface = new Error("Email already Existed");
        error.statusCode = 409;
        throw error;
      }
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
        .catch((err: ErrorInterface) => {
          throw err;
        });
    })
    .catch((err: ErrorInterface) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      deleteFile(avatarPath!);
      next(err);
    });
};
