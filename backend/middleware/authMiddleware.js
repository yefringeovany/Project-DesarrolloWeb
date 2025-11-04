import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import Rol from "../models/Rol.js";

// Verificar token JWT
export const verificarToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No se proporcionó token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

// Verificar si el usuario es administrador
export const verificarAdmin = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id_usuario, { include: Rol });

    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

    if (usuario.Rol.nombre_rol.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Acceso denegado, solo administradores" });
    }

    next();
  } catch (error) {
    console.error("Error en verificarAdmin:", error);
    res.status(500).json({ message: "Error en la verificación del rol" });
  }
};

// Validar máximo de 2 administradores
export const validarMaximosAdmins = async (req, res, next) => {
  try {
    const { rolId } = req.body;
    const rol = await Rol.findByPk(rolId);
    if (!rol) return res.status(400).json({ message: "El rol especificado no existe" });

    if (rol.nombre_rol.toLowerCase() === "admin") {
      const totalAdmins = await Usuario.count({
        include: { model: Rol, where: { nombre_rol: "admin" } },
      });

      if (totalAdmins >= 2) {
        return res.status(400).json({
          message: "No se pueden registrar más de 2 administradores",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Error en validarMaximosAdmins:", error);
    res.status(500).json({ message: "Error al validar cantidad de administradores" });
  }
};
