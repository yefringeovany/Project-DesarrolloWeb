import jwt from "jsonwebtoken";

export const generarToken = (usuario) => {
  const payload = {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rolId: usuario.rolId,
     rol: usuario.Rol?.nombre_rol || usuario.rol || "sin-rol", // nombre del rol
    clinicaAsignadaId: usuario.clinicaAsignadaId || null,     // opcional, útil para médicos
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
};
