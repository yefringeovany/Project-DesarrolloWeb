const API_URL = import.meta.env.VITE_API_URL;

// 📌 GET - Obtener pacientes
export const obtenerPacientes = async (token) => {
  const res = await fetch(`${API_URL}/api/pacientes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};

// 📌 POST - Crear paciente
export const crearPaciente = async (token, paciente) => {
  const res = await fetch(`${API_URL}/api/pacientes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(paciente),
  });
  return await res.json();
};

// 📌 DELETE - Eliminar paciente
export const eliminarPaciente = async (token, id) => {
  const res = await fetch(`${API_URL}/api/pacientes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};

// 📌 PUT - Actualizar paciente
export const actualizarPaciente = async (token, id, paciente) => {
  const res = await fetch(`${API_URL}/api/pacientes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(paciente),
  });
  return await res.json();
};
