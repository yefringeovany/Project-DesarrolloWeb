export const puedeGestionarPacientes = (rol) => {
  return rol === "admin" || rol === "Enfermero";
};
export const puedeGestionarClinicas = (rol) => {
  return ["admin", "Enfermero"].includes(rol);
};
// ✅ Nueva función para restringir la creación de turnos
export const puedeCrearTurnos = (rol) => {
  return rol === "admin" || rol === "Enfermero";
};
