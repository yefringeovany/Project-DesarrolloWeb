// routes/pacienteRoutes.js
import express from "express";
import {
  crearPaciente,
  listarPacientes,
  buscarPaciente,
  obtenerPaciente,
  actualizarPaciente,
  eliminarPaciente,
} from "../controllers/pacienteController.js";

import { 
  verificarToken, 
  personalAutorizado,
  soloAdmin
} from "../middlewares/authMiddleware.js";

const routerPaciente = express.Router();

// Todas requieren autenticación
routerPaciente.use(verificarToken);
routerPaciente.use(personalAutorizado);

// Rutas CRUD
routerPaciente.post("/", crearPaciente);              // Solo admin/enfermero
routerPaciente.get("/", listarPacientes);
routerPaciente.get("/buscar", buscarPaciente);
routerPaciente.get("/:id", obtenerPaciente);
routerPaciente.put("/:id", actualizarPaciente);
routerPaciente.delete("/:id", soloAdmin, eliminarPaciente);

export default routerPaciente;