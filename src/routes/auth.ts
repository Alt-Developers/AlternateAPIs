import { Router } from "express";
import * as authController from "../controllers/auth";
import { body } from "express-validator";
import dCrypt from "../middleware/isAuth";

const router = Router();

router.post(
  "/login",
  [
    body("email", "Email is invalid.").notEmpty().toLowerCase().isEmail(),
    body("pass", "password must be filled.").notEmpty(),
  ],
  authController.login
);

router.post(
  "/signup",
  [
    body("email").toLowerCase().isEmail(),
    body(
      "pass",
      "Password should have at least eight characters one letter and one number."
    ).matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, "i"),
    body("firstName").notEmpty().isLength({ max: 30, min: 2 }),
    body("lastName").notEmpty(),
    body("primaryColor", "Primary Color not found.").notEmpty(),
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
router.post(
  "/editConfig",
  dCrypt,
  [
    body("showCovid", "COVID")
      .isString()
      .isLength({ min: 7, max: 7 })
      .custom((value) => {
        if (value !== "covShow" && value !== "covHide") {
          return Promise.reject("Option does not exist.");
        } else return Promise.resolve();
      }),
    body("dateTime", "DATETIME")
      .isString()
      .isLength({ min: 3, max: 3 })
      .custom((value) => {
        if (value !== "24h" && value !== "12h") {
          return Promise.reject("Option does not exist.");
        } else return Promise.resolve();
      }),
    body("language", "LANGUAGE").toUpperCase().isLength({ min: 2, max: 2 }),
  ],
  authController.editConfig
);

export default router;
