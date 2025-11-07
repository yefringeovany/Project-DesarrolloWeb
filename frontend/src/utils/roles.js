export const puedeGestionarPacientes = (rol) => {
  return rol === "admin" || rol === "Enfermero";
};
