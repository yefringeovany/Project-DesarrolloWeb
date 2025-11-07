const API_URL = import.meta.env.VITE_API_URL;

export const obtenerPacientes = async (token) => {
  const res = await fetch(`${API_URL}/pacientes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};

export const crearPaciente = async (token, paciente) => {
  const res = await fetch(`${API_URL}/pacientes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(paciente),
  });
  return await res.json();
};

export const eliminarPaciente = async (token, id) => {
  const res = await fetch(`${API_URL}/pacientes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
};

export const actualizarPaciente = async (token, id, paciente) => {
  const res = await fetch(`${API_URL}/pacientes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(paciente),
  });
  return await res.json();
};
