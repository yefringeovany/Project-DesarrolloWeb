// routes/usuarioRoutes.js
import express from "express";
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../controllers/usuarioController.js";
import { verificarToken, soloAdmin } from "../middlewares/authMiddleware.js";

const routerUsuario = express.Router();

// ✅ Todas las rutas de usuario solo accesibles por admin
routerUsuario.use(verificarToken, soloAdmin);

// 📋 CRUD de Usuarios
routerUsuario.get("/", obtenerUsuarios);          // Listar todos
routerUsuario.get("/:id", obtenerUsuarioPorId);   // Ver uno
routerUsuario.post("/", crearUsuario);            // Crear
routerUsuario.put("/:id", actualizarUsuario);     // Actualizar
routerUsuario.delete("/:id", eliminarUsuario);    // Eliminar

export default routerUsuario;
