import { Router } from "express";
import * as authController from "../controllers/auth";
import { body } from "express-validator";
import dCrypt from "../middleware/isAuth";

const router = Router();

router.post(
  "/login",
  [
    body("email", "Invalid Email|Please input a valid email")
      .notEmpty()
      .toLowerCase()
      .isEmail(),
    body("pass", "Password Required|Password field is empty").notEmpty(),
  ],
  authController.login
);

router.post(
  "/signup",
  [
    body("email").toLowerCase().isEmail(),
    body(
      "pass",
      "Unsecure Password|A secure password should have at least eight characters one letter and one number."
    ).matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, "i"),
    body(
      "firstName",
      "Invalid First Name|First name must be longer than 2 letters and shorter than 30 letters"
    )
      .notEmpty()
      .isLength({ max: 30, min: 2 }),
    body("lastName", "Invalid Last Name|Last name must be filled.").notEmpty(),
    body(
      "primaryColor",
      "Accent Color Required|An accent color is required to make an account"
    ).notEmpty(),
  ],
  authController.signup
);

router.post("/updateUserProfilePicture", dCrypt, authController.changeAvatar);
router.post("/updateUserInfo", dCrypt, authController.editAccount);
router.post(
  "/changePassword",
  [
    body(
      "newPassword",
      "Unsecure Password|A secure password should have at least eight characters one letter and one number."
    ).matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, "i"),
  ],
  dCrypt,
  authController.editPassword
);

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
