// ========================================
// pacienteRoutes.js
// ========================================
import express from "express";
import {
  crearPaciente,
  buscarPaciente,
  obtenerPaciente,
  listarPacientes,
  actualizarPaciente,
  eliminarPaciente
} from "../controllers/pacienteController.js";
import { 
  verificarToken, 
  personalAutorizado,
  soloAdmin
} from "../middleware/authMiddleware.js";

const routerPaciente = express.Router();

// Todas las rutas requieren autenticación
routerPaciente.use(verificarToken);
routerPaciente.use(personalAutorizado);

routerPaciente.post("/", crearPaciente);
routerPaciente.get("/buscar", buscarPaciente);
routerPaciente.get("/", listarPacientes);
routerPaciente.get("/:id", obtenerPaciente);
routerPaciente.put("/:id", actualizarPaciente);
routerPaciente.delete("/:id", soloAdmin, eliminarPaciente);

export default routerPaciente;