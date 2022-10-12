import { Router } from "express";
import * as authController from "../controllers/auth";
import verifyToken from "../helpers/verifyToken";

const router = Router();

router.post("/login", authController.login);
router.post("/signup", authController.signup);

router.post("/change-pw-with-password", authController.changePassWithPassword);

router.get("/decode-token", verifyToken, authController.decodeToken);
router.get(
  "/forget-password",
  authController.fotgetPassword,
  authController.verifyPasswordToken
);
router.post("/change-pw-with-token", authController.changePassWithToken);

export default router;
