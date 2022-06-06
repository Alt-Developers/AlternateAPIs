import env from "dotenv";
import bcrypt from "bcryptjs";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import newError from "../utilities/newError";
import { deleteFile } from "../utilities/fileHelper";
import User from "../models/authentication/user";
import { validationResult } from "express-validator";
import validationErrCheck from "../utilities/validationErrChecker";
let maxFileSize = 8 * 1000 * 1000;
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SEND_GRID_API!);

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

    if (req.file) {
      if (req.file?.size > maxFileSize) {
        deleteFile(req.file.path);
        return newError(
          422,
          "Profile Picture too big (max 8MB)",
          "validation",
          "picture"
        );
      }
    }

    if (!email || !password || !firstName || !lastName) {
      if (!isDefault) deleteFile(avatarPath);
      return newError(
        400,
        "Not All Fields Were Filled|All fields are required to create an account",
        "validation"
      );
    }

    const user = await User.findOne({ email: email });
    if (user) {
      deleteFile(avatarPath);
      return newError(
        409,
        "Existing Email|This email is already registered to a SS Account. Report to SS Developers if you are sure that the following email is your's",
        "user"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      firstName: firstName,
      lastName: lastName,
      password: hashedPassword,
      email: email,
      avatar: avatarPath,
      preferredColor: color,
      accType: "user",
    });

    const result = await newUser.save();

    sgMail
      .send({
        from: "support@ssdevelopers.xyz",
        templateId: "d-b5bc3c206eb743babc6b540e5f96b090",
        to: result.email,
        dynamicTemplateData: {
          name: result.firstName + " " + result.lastName,
          email: result.email,
          // @ts-ignore
          createdAt: result.createdAt,
        },
      })
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });

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
    if (!user)
      return newError(
        404,
        "User Not Found|Doesn't seem like this email is registered to a SS Account",
        "user"
      );

    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      return newError(
        401,
        "Incorrect Password|Enter the correct password to login",
        "user"
      );
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id,
      },
      process.env.JWT_KEY!
    );

    res.status(200).json({
      accType: user.accType,
      token: token,
      isNewUser: user.timetables?.primaryClass ? false : true,
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
    if (!user) return newError(404, "User not found.", "user");

    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      color: user.preferredColor,
      profilePicture: user.avatar,
      email: user.email,
      config: {
        dateTime: user.preferredConfig.dateTime || "24h",
        showCovid: user.preferredConfig.showCovid || "covShow",
        language: user.preferredConfig.language || "EN",
        tmrPref: user.preferredConfig.tmrPref || "hide",
      },
      type: user.accType,
    });
  } catch (err) {
    next(err);
  }
};

export const changeAvatar: RequestHandler = async (req, res, next) => {
  const userId = req.userId;
  const newAvatarPath = req.file?.path.replace("\\", "/");
  if (!newAvatarPath)
    return newError(400, "Attachment not found.", "validation");

  const user = await User.findById(userId);
  if (!user) {
    deleteFile(newAvatarPath);
    return newError(404, "User not found.", "user");
  }
  const isDefault = user.avatar === "images/default.png";

  if (req.file) {
    if (req.file?.size > maxFileSize) {
      deleteFile(req.file.path);
      return newError(
        422,
        "Profile Picture too big (max 8MB)",
        "validation",
        "picture"
      );
    }
  }

  if (!isDefault) deleteFile(user.avatar);
  user.avatar = newAvatarPath;
  const result = await user.save();

  res.status(200).json({
    message: "Successfully Changed User's Profile Picture",
    newAvatar: result.avatar,
  });
};

export const editAccount: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const color = req.body.color;

    const user = await User.findById(userId);
    if (!user)
      return newError(
        404,
        "User not found|This token seems to be invalid so nothing will be changed.",
        "user"
      );

    if (firstName.length < 2)
      return newError(
        404,
        "Invalid First Name|First name must be at least 2 letters long.",
        "validation",
        "firstName"
      );
    if (lastName.length < 2)
      return newError(
        404,
        "Invalid Last Name|Last name must be at least 2 letters long ",
        "user",
        "lastName"
      );

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (color) user.preferredColor = color;

    const result = await user.save();

    res.status(201).json({
      message: "Change successfully.",
      curInfo: {
        firstName: result.firstName,
        lastName: result.lastName,
        newColor: result.preferredColor,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const editPassword: RequestHandler = async (req, res, next) => {
  validationErrCheck(req);

  const userId = req.userId;
  const newPassword = req.body.newPassword;
  const ConfirmNewPassword = req.body.confirmNewPassword;
  const password = req.body.password;

  try {
    const user = await User.findById(userId);
    if (!user)
      return newError(
        404,
        "User not found|This token seems to be invalid so the password will not be changed.",
        "user"
      );

    if (newPassword !== ConfirmNewPassword) {
      return newError(
        422,
        "Confirmation Password Not Matching|The confirmation password must be the same as the new password to change your password.",
        "user"
      );
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword)
      return newError(
        403,
        "Old Password Incorrect|To change your password you need to enter your old password correctly.",
        "user"
      );

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedNewPassword;
    const result = await user.save();
    res.status(201).json({
      modal: true,
      header: "Password Changed",
      message: `Successfully Changed The Password. Your new password is ${result.password}`,
    });
  } catch (err) {
    next(err);
  }
};

export const editConfig: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const userId = req.userId;

    const dateTime: string = req.body.dateTime;
    const language: string = req.body.language;
    const showCovid: string = req.body.showCovid;
    const tmrPref: string = req.body.tmrPref;

    const user = await User.findById(userId);
    if (!user) return newError(404, "User not found.", "user");

    if (dateTime) user.preferredConfig.dateTime = dateTime;
    if (language) user.preferredConfig.language = language;
    if (showCovid) user.preferredConfig.showCovid = showCovid;
    if (tmrPref) user.preferredConfig.tmrPref = tmrPref;

    const result = await user.save();

    res.status(201).json({
      newConfig: result.preferredConfig,
      message: "Successfully Changed The Config.",
    });
  } catch (err) {
    next(err);
  }
};

export const apiLogin: RequestHandler = async (req, res, next) => {
  try {
    validationErrCheck(req);

    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password)
      return newError(
        400,
        "Email or Password not found|We need both email and password to process the login",
        "prompt"
      );

    const user = await User.findOne({ email: email });
    if (!user)
      return newError(
        404,
        "User Not Found|Please recheck the email.",
        "prompt"
      );

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword)
      return newError(
        401,
        "Incorrect Password|Enter the correct password to login."
      );

    return res.status(200).json({
      ssAccId: user._id,
      userInfo: {
        fName: user.firstName,
        lName: user.lastName,
        color: user.preferredColor,
        email: user.email,
        profile: `https://apis.ssdevelopers.xyz/${user.avatar}`,
      },
    });
  } catch (error) {
    next(error);
  }
};
