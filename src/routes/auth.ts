import { Router } from "express";
import * as authController from "../controllers/auth";
import { body } from "express-validator";
import dCrypt from "../middleware/isAuth";

const router = Router();

router.post(
  "/login",
  [
    body("email", "Email is invalid.").notEmpty().isEmail(),
    body("pass", "password must be filled.").notEmpty(),
  ],
  authController.login
);

router.post(
  "/signup",
  [
    body("email").isEmail(),
    body(
      "pass",
      "Password should have at least eight characters one letter and one number."
    ).matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, "i"),
    body("firstName").notEmpty().isLength({ max: 30, min: 2 }),
    body("lastName").notEmpty(),
  ],
  authController.signup
);

router.post("/updateUserProfilePicture", dCrypt, authController.changeAvatar);
// router.post(
//   "/updateUserInfo",
//   [
//     body("email", "Invalid Email").isEmail(),
//     body("firstName"),
//     body("lastName"),
//   ],
//   dCrypt,
//   authController.editAccount
// );
// router.post("/changePassword", dCrypt, authController.editPassword);

router.get("/getUserData", dCrypt, authController.getUserData);

export default router;
