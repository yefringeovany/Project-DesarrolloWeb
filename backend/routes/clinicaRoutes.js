import express from "express";
import {
  crearClinica,
  listarClinicas,
  actualizarClinica,
  eliminarClinica,
} from "../controllers/clinicaController.js";

const routerClinica = express.Router();

// ✅ Listar todas las clínicas (público)
routerClinica.get("/", listarClinicas);

// ✅ Crear clínica
routerClinica.post("/", crearClinica);

// ✅ Actualizar clínica
routerClinica.put("/:id", actualizarClinica);

// ✅ Eliminar clínica
routerClinica.delete("/:id", eliminarClinica);

export default routerClinica;
