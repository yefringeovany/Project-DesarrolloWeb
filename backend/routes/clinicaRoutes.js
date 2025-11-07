import express from "express";
import {
  crearClinica,
  listarClinicas,
  actualizarClinica,
  eliminarClinica,
} from "../controllers/clinicaController.js";
import {
  verificarToken,
  verificarRoles,
} from "../middlewares/authMiddleware.js";

const routerClinica = express.Router();

// ✅ Listar todas las clínicas (público o autenticado)
routerClinica.get("/", listarClinicas);

// ✅ Crear clínica (solo admin o enfermero)
routerClinica.post(
  "/",
  verificarToken,
  verificarRoles("admin", "enfermero"),
  crearClinica
);

// ✅ Actualizar clínica (solo admin)
routerClinica.put(
  "/:id",
  verificarToken,
  verificarRoles("admin", "enfermero"),
  actualizarClinica
);

// ✅ Eliminar clínica (solo admin)
routerClinica.delete(
  "/:id",
  verificarToken,
  verificarRoles("admin"),
  eliminarClinica
);

export default routerClinica;
