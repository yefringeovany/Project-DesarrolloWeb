export const puedeGestionarPacientes = (rol) => {
  return rol === "admin" || rol === "Enfermero";
};
export const puedeGestionarClinicas = (rol) => {
  return ["admin", "Enfermero"].includes(rol);
};
