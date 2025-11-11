import express from "express";
import {
  crearTurno,
  obtenerColaPorClinica,
  cambiarEstadoTurno,
  obtenerSiguienteTurno,
  obtenerHistorialTurno,
  obtenerEstadisticasClinica,
  obtenerTurnosPantalla,
  // Nuevas funciones para médicos
  obtenerMiColaTurnos,
  llamarSiguientePaciente,
  iniciarAtencion,
  finalizarAtencion
} from "../controllers/turnoController.js";
import { 
  verificarToken, 
  medicoOEnfermero,
  personalAutorizado,
  verificarClinicaAsignada,
  verificarRoles
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// ==========================
// Rutas públicas (para pantallas)
// ==========================
router.get("/pantalla", obtenerTurnosPantalla);

// ==========================
// Rutas para MÉDICOS
// ==========================

// Obtener mi cola de turnos (solo médicos)
router.get(
  "/mi-cola",
  verificarToken,
  verificarRoles("medico"),
  obtenerMiColaTurnos
);

// Llamar al siguiente paciente (solo médicos)
router.post(
  "/llamar-siguiente",
  verificarToken,
  verificarRoles("medico"),
  llamarSiguientePaciente
);

// Iniciar atención de un turno (solo médicos)
router.patch(
  "/:id/iniciar-atencion",
  verificarToken,
  verificarRoles("medico"),
  iniciarAtencion
);

// Finalizar atención de un turno (solo médicos)
router.patch(
  "/:id/finalizar-atencion",
  verificarToken,
  verificarRoles("medico"),
  finalizarAtencion
);

// ==========================
// Rutas para ENFERMEROS/ADMIN
// ==========================

// Crear turno (solo enfermero/admin)
router.post(
  "/",
  verificarToken,
  verificarRoles("enfermero", "admin"),
  crearTurno
);

// ==========================
// Rutas generales (personal autorizado)
// ==========================

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

// Cambiar estado de turno (enfermeros y admin pueden cambiar cualquier estado)
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