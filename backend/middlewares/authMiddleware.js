import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import Rol from "../models/Rol.js";

// ==========================
// Verificar token JWT
// ==========================
export const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        mensaje: "Token no proporcionado. Acceso denegado.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findByPk(decoded.id, {
      include: [{ model: Rol }],
      attributes: { exclude: ["password"] },
    });

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Usuario no encontrado. Token inválido.",
      });
    }

    if (!usuario.usuarioActivo) {
      return res.status(403).json({
        mensaje: "Usuario desactivado. Contacte al administrador.",
      });
    }

    await usuario.update({ ultimoAcceso: new Date() });
    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ mensaje: "Token expirado." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ mensaje: "Token inválido." });
    }
    console.error("Error en verificación de token:", error);
    return res
      .status(500)
      .json({ mensaje: "Error al verificar autenticación." });
  }
};

// ==========================
// Verificar roles específicos
// ==========================
export const verificarRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        mensaje: "Usuario no autenticado.",
      });
    }

   const rolUsuario = req.usuario.Rol?.nombre_rol?.toLowerCase();

    if (!rolesPermitidos.map(r => r.toLowerCase()).includes(rolUsuario)) {
      return res.status(403).json({
        mensaje: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(" o ")}`
      });
    }

    next();
  };
};

// ==========================
// Middleware específicos por rol
// ==========================
export const soloAdmin = verificarRoles("admin");
export const medicoOEnfermero = verificarRoles("medico", "enfermero", "admin");
export const personalAutorizado = verificarRoles(
  "medico",
  "enfermero",
  "recepcionista",
  "admin"
);

// ==========================
// Validar acceso a clínica asignada
// ==========================
export const verificarClinicaAsignada = async (req, res, next) => {
  try {
    const { clinicaId } = req.params;
    const usuario = req.usuario;

    if (usuario.Rol.nombre_rol === "admin") return next();

    if (
      usuario.clinicaAsignadaId &&
      usuario.clinicaAsignadaId !== parseInt(clinicaId)
    ) {
      return res.status(403).json({
        mensaje: "No tiene acceso a esta clínica.",
      });
    }

    next();
  } catch (error) {
    console.error("Error al verificar clínica asignada:", error);
    return res
      .status(500)
      .json({ mensaje: "Error al verificar permisos." });
  }
};

// ==========================
// Rate limiting simple (prevenir abuso)
// ==========================
const requestCounts = new Map();

export const limitarSolicitudes = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const userId = req.usuario?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requestCounts.has(userId)) {
      requestCounts.set(userId, []);
    }

    const userRequests = requestCounts.get(userId);
    const recentRequests = userRequests.filter((time) => time > windowStart);

    if (recentRequests.length >= maxRequests) {
      return res
        .status(429)
        .json({ mensaje: "Demasiadas solicitudes. Intente más tarde." });
    }

    recentRequests.push(now);
    requestCounts.set(userId, recentRequests);

    // Limpieza periódica
    if (now % 300000 < 1000) {
      for (const [key, times] of requestCounts.entries()) {
        const filtered = times.filter((time) => time > windowStart);
        if (filtered.length === 0) requestCounts.delete(key);
        else requestCounts.set(key, filtered);
      }
    }

    next();
  };
};
