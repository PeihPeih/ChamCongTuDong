import express from "express";
const router = express.Router();
import { changePassword, login, logout, register } from "../controller/authController.js";
import { verifyToken } from "../utils/verifyToken.js";

router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyToken, logout);
router.post("/change-password", verifyToken, changePassword);

export default router;
