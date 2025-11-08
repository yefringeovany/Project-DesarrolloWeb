import express from "express";
import {
  crearTurno,
  obtenerColaPorClinica,
  cambiarEstadoTurno,
  obtenerSiguienteTurno,
  obtenerHistorialTurno,
  obtenerEstadisticasClinica,
  obtenerTurnosPantalla
} from "../controllers/turnoController.js";
import { 
  verificarToken, 
  medicoOEnfermero,
  personalAutorizado,
  verificarClinicaAsignada,
  verificarRoles // <-- AGREGAR ESTO
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// ==========================
// Rutas públicas (para pantallas)
// ==========================
router.get("/pantalla", obtenerTurnosPantalla);

// ==========================
// Rutas protegidas
// ==========================

// Crear turno (solo enfermero/admin)
router.post(
  "/",
  verificarToken,
  verificarRoles("enfermero", "admin"), // <- Solo estos roles
  crearTurno
);

// Obtener cola de clínica
router.get(
  "/clinica/:clinicaId",
  verificarToken,
  personalAutorizado,
  verificarClinicaAsignada,
  obtenerColaPorClinica
);

// Obtener siguiente turno
router.get(
  "/clinica/:clinicaId/siguiente",
  verificarToken,
  personalAutorizado,
  verificarClinicaAsignada,
  obtenerSiguienteTurno
);

// Cambiar estado de turno
router.patch(
  "/:id/estado",
  verificarToken,
  personalAutorizado,
  cambiarEstadoTurno
);

// Obtener historial de turno
router.get(
  "/:id/historial",
  verificarToken,
  personalAutorizado,
  obtenerHistorialTurno
);

// Estadísticas de clínica
router.get(
  "/clinica/:clinicaId/estadisticas",
  verificarToken,
  personalAutorizado,
  verificarClinicaAsignada,
  obtenerEstadisticasClinica
);

export default router;