// routes/secureRoutes.js
import express from "express";
import { verificarToken, verificarAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ruta accesible solo para admins
router.get("/solo-admin", verificarToken, verificarAdmin, (req, res) => {
  res.json({ message: "Bienvenido Admin, tienes acceso total 🔐" });
});

// Ruta accesible para cualquier usuario logueado
router.get("/solo-logueado", verificarToken, (req, res) => {
  res.json({ message: `Hola ${req.usuario.rol}, estás logueado ✅` });
});

export default router;
