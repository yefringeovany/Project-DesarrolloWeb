const API_URL = import.meta.env.VITE_API_URL;

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return await res.json();
};

export const register = async (nombre, email, password, rolId, clinicaAsignadaId) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, email, password, rolId, clinicaAsignadaId  }),
  });
  return await res.json();
};
