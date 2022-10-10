import { Router } from "express";
import * as authController from "../controllers/auth";
import verifyToken from "../helpers/verifyToken";

const router = Router();

router.post("/login", authController.login);
router.get("/decode-token", verifyToken, authController.decodeToken);

export default router;
