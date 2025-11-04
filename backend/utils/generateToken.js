import jwt from "jsonwebtoken";

export const generarToken = (usuario) => {
  const payload = {
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.Rol?.nombre_rol || "user",
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};
