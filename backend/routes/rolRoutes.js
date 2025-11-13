import express from "express";
import Rol from "../models/Rol.js";

const routerRol = express.Router();

// Obtener todos los roles
routerRol.get("/", async (req, res) => {
  try {
    const roles = await Rol.findAll();
    res.json(roles);
  } catch (error) {
    console.error("Error al obtener roles:", error);
    res.status(500).json({ mensaje: "Error al obtener roles" });
  }
});

export default routerRol;
