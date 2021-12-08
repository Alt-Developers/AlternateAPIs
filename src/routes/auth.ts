import { Router } from "express";
import * as authController from "../controllers/auth";
import { body } from "express-validator";

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

export default router;
