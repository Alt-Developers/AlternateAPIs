import { Router } from "express";
import * as authController from "../controllers/auth";
import { body } from "express-validator";
import dCrypt from "../middleware/isAuth";

const router = Router();

router.post("/login", authController.login);
router.post(
  "/signup",
  [
    body("email").isEmail(),
    body(
      "pass",
      "Password should have at least eight characters one letter and one number."
    ).matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, "i"),
    body("firstName"),
    body("lastName"),
  ],
  authController.signup
);

router.post(
  "/updateUserProfilePicture",
  dCrypt,
  authController.postEditProfilePicture
);
router.post(
  "/updateUserInfo",
  [
    body("email", "Invalid Email").isEmail(),
    body("firstName"),
    body("lastName"),
  ],
  dCrypt,
  authController.editAccount
);
router.post("/changePassword", dCrypt, authController.editPassword);

router.get("/getUserData", dCrypt, authController.getPlayerData);

export default router;
