import express from "express";
import { obtenerHistorialTurnos } from "../controllers/historialTurnoController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET: todos los historiales (visible a todos los roles autenticados)
router.get("/", verificarToken, obtenerHistorialTurnos);

export default router;
