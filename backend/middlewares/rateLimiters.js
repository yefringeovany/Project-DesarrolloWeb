import rateLimit from "express-rate-limit";

// Limitar intentos de login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 5 intentos
  message: {
    mensaje: "Demasiados intentos de inicio de sesión. Intente en 15 minutos."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitar creación de recursos
export const creacionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 solicitudes
  message: {
    mensaje: "Demasiadas solicitudes. Intente más tarde."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
