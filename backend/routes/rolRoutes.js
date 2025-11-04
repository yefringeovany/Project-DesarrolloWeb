import express from "express";
import {
  crearRol,
  obtenerRoles,
  obtenerRolPorId,
  actualizarRol,
  eliminarRol,
} from "../controllers/rolController.js";

import { verificarToken, verificarAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🔐 RUTAS PROTEGIDAS CON JWT
 * - Solo los administradores pueden crear, editar o eliminar roles.
 * - Los usuarios autenticados pueden consultar roles.
 */

// Crear rol (solo admin)
router.post("/", verificarToken, verificarAdmin, crearRol);

// Obtener todos los roles (autenticado)
router.get("/", verificarToken, obtenerRoles);

// Obtener rol por ID (autenticado)
router.get("/:id", verificarToken, obtenerRolPorId);

// Actualizar rol (solo admin)
router.put("/:id", verificarToken, verificarAdmin, actualizarRol);

// Eliminar rol (solo admin)
router.delete("/:id", verificarToken, verificarAdmin, eliminarRol);

export default router;
