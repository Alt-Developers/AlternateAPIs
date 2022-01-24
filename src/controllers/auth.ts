import env from "dotenv";
import bcrypt from "bcryptjs";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import newError from "../utilities/newError";
import { deleteFile } from "../utilities/fileHelper";
import User from "../models/authentication/user";
import { validationResult } from "express-validator";
import validationErrCheck from "../utilities/validationErrChecker";

export const signup: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const email = req.body.email;
    const password = req.body.pass;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const color = req.body.primaryColor;
    let avatarPath: string;
    let isDefault: boolean;

    if (!req.file) {
      avatarPath = "images/default.png";
      isDefault = true;
    } else {
      avatarPath = req.file.path.replace("\\", "/");
      isDefault = false;
    }

    if (!email || !password || !firstName || !lastName) {
      if (!isDefault) deleteFile(avatarPath);
      return newError(400, "Not all fields were filled.");
    }

    const user = await User.findOne({ email: email });
    if (user) return newError(409, "Email existed.");

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      firstName: firstName,
      lastName: lastName,
      password: hashedPassword,
      email: email,
      avatar: avatarPath,
      preferredColor: color,
    });

    const result = await newUser.save();

    res.status(201).json({
      message: "Successfully Created an account.",
    });
  } catch (err) {
    next(err);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const email = req.body.email;
    const password = req.body.pass;

    const user = await User.findOne({ email: email });
    if (!user) return newError(404, "User not found.");

    const isCorrectPassword = bcrypt.compare(password, user.password);
    if (!isCorrectPassword) return newError(401, "Wrong Password.");

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id,
      },
      process.env.JWT_KEY!
    );

    res.status(200).json({
      token: token,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserData: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return newError(404, "User not found.");

    res.status(200).json({
      token: req.authToken,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      img: user.avatar,
    });
  } catch (err) {
    next(err);
  }
};

export const changeAvatar: RequestHandler = async (req, res, next) => {
  const userId = req.userId;
  const newAvatarPath = req.file?.path.replace("\\", "/");
  if (!newAvatarPath) return newError(400, "Attachment not found.");

  const user = await User.findById(userId);
  if (!user) {
    deleteFile(newAvatarPath);
    return newError(404, "User not found.");
  }
  const isDefault = user.avatar === "images/default.png";

  if (!isDefault) deleteFile(user.avatar);
  user.avatar = newAvatarPath;
  const result = await user.save();

  res.status(200).json({
    message: "Successfully edited user's profile picture.",
    newAvatar: result.avatar,
  });
};

// export const editAccount: RequestHandler = (req, res, next) => {
//     const email = req.body.email;
//     const firstName = req.body.firstName;
//     const lastName = req.body.lastName;
//     const password = req.body.password;
//     const userId = req.userId;
//     const errors = validationResult(req);
//     let snapshot: any;

//     if (password)
//       return newError(
//         400,
//         "Can't change password in this endpoint / please select the right service."
//       );

//     if (!errors.isEmpty()) {
//       const errMsg = `Validation Error: ${errors.array()[0].msg}.`;
//       console.log(errMsg);
//       return newError(422, errMsg);
//     }

//     User.findById(userId)
//       .then((user) => {
//         if (!user) return newError(404, "user not found.");
//         snapshot = user;
//         if (email) user.email = email;
//         if (firstName) user.firstName = firstName;
//         if (lastName) user.lastName = lastName;

//         return user.save();
//       })
//       .then((result) => {
//         const updated: UnlockedObjectInterface = {};
//         if (email) updated.email = result.email;
//         if (firstName) updated.firstName = result.firstName;
//         if (lastName) updated.lastName = result.lastName;

//         res.status(201).json({
//           message: "Successfully Updated a user",
//           updated: updated,
//         });
//       })
//       .catch((err) => {
//         next(err);
//       });
//   };

//   export const editPassword: RequestHandler = (req, res, next) => {
//     const userId = req.userId;
//     const newPassword = req.body.newPassword;
//     const ConfirmNewPassword = req.body.confirmNewPassword;
//     const password = req.body.password;

//     let fetchedUser: UserInterface;

//     if (newPassword !== ConfirmNewPassword)
//       return newError(
//         422,
//         "newPassword and ConfirmNewPassword must be the same."
//       );

//     User.findById(userId)
//       .then((user) => {
//         if (!user) return newError(404, "User not found.");
//         fetchedUser = user;
//         return bcrypt.compare(password, user.password);
//       })
//       .then((isCorrect) => {
//         if (!isCorrect)
//           return newError(
//             403,
//             "Wrong Old Password. / Not Authorized. / Forbidden."
//           );
//         bcrypt
//           .hash(newPassword, 12)
//           .then((hashedPassword) => {
//             fetchedUser.password = hashedPassword;
//             fetchedUser.save();
//             return res.status(201).json({
//               message: "Successfully Edited a password.",
//             });
//           })
//           .catch((err) => {
//             throw err;
//           });
//       })
//       .catch((err) => next(err));
//   };

export const editConfig: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const userId = req.userId;

    const dateTime: string = req.body.dateTime;
    const language: string = req.body.language;
    const showCovid: string = req.body.showCovid;

    const user = await User.findById(userId);
    if (!user) return newError(404, "User not found.");

    if (dateTime) user.preferredConfig.dateTime = dateTime;
    if (language) user.preferredConfig.language = language;
    if (showCovid) user.preferredConfig.showCovid = showCovid;

    const result = await user.save();

    res.status(201).json({
      newConfig: result.preferredConfig,
      message: "success!",
    });
  } catch (err) {
    next(err);
  }
};
