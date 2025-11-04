import express from "express";
import { register, login } from "../controllers/authController.js";
import { validarMaximosAdmins } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", validarMaximosAdmins, register);
router.post("/login", login);

export default router;
