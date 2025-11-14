import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { puedeGestionarClinicas } from "../utils/roles";
import "../styles/Clinica.css"; // Importar los estilos modernos

const Clinicas = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [clinicas, setClinicas] = useState([]);
  const [form, setForm] = useState({ nombre_clinica: "", direccion: "", telefono: "" });
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const token = localStorage.getItem("token");

  const fetchClinicas = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clinicas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClinicas(data.clinicas || []);
    } catch (err) {
      console.error("Error al obtener clínicas:", err);
      setError("No se pudieron cargar las clínicas");
    }
  };

  useEffect(() => {
    fetchClinicas();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    const url = editando
      ? `${import.meta.env.VITE_API_URL}/api/clinicas/${editando}`
      : `${import.meta.env.VITE_API_URL}/api/clinicas`;
    const method = editando ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.mensaje || "Error al guardar la clínica");
        return;
      }

      setForm({ nombre_clinica: "", direccion: "", telefono: "" });
      setEditando(null);
      setMensaje(editando ? "✅ Clínica actualizada correctamente." : "✅ Clínica registrada correctamente.");
      fetchClinicas();
    } catch (err) {
      console.error("Error al guardar clínica:", err);
      setError("Error de conexión con el servidor");
    }
  };

  const handleEditar = (clinica) => {
    setForm({
      nombre_clinica: clinica.nombre_clinica,
      direccion: clinica.direccion,
      telefono: clinica.telefono || "",
    });
    setEditando(clinica.id);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta clínica?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clinicas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.mensaje || "Error al eliminar la clínica");
        return;
      }
      setMensaje("🗑️ Clínica eliminada correctamente.");
      fetchClinicas();
    } catch (err) {
      console.error("Error al eliminar clínica:", err);
    }
  };

  if (!puedeGestionarClinicas(usuario.rol)) {
    return (
      <div className="no-access-container">
        <div className="glass-card text-center p-5">
          <h3>🚫 Acceso Denegado</h3>
          <p>No tienes permisos para gestionar clínicas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="clinicas-page">
      {/* HEADER */}
      <header className="clinicas-header">
        <div className="header-top">
          <h1 className="titulo">🏥 Gestión de Clínicas</h1>
          <button className="btn-modern btn-back" onClick={() => navigate("/dashboard")}>
            ← Regresar al Dashboard
          </button>
        </div>
        <p className="subtitulo">Administra y controla la información de tus clínicas registradas.</p>
      </header>

      {/* FORMULARIO */}
      <section className="glass-card form-card">
        <h4>{editando ? "✏️ Editar Clínica" : "➕ Registrar Nueva Clínica"}</h4>
        <form onSubmit={handleSubmit} className="clinica-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Nombre de la clínica"
              name="nombre_clinica"
              value={form.nombre_clinica}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              placeholder="Dirección"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              placeholder="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
            />
          </div>

          <div className="botones-form">
            <button type="submit" className="btn-modern btn-green">
              {editando ? "Actualizar Clínica" : "Registrar Clínica"}
            </button>
            {editando && (
              <button
                type="button"
                className="btn-modern btn-gray"
                onClick={() => {
                  setEditando(null);
                  setForm({ nombre_clinica: "", direccion: "", telefono: "" });
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {mensaje && <div className="alert success">{mensaje}</div>}
        {error && <div className="alert error">{error}</div>}
      </section>

      {/* TABLA DE CLÍNICAS */}
      <section className="glass-card tabla-card">
        <h4>📋 Lista de Clínicas</h4>
        <div className="tabla-container">
          <table className="clinicas-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clinicas.length > 0 ? (
                clinicas.map((c, i) => (
                  <tr key={c.id}>
                    <td>{i + 1}</td>
                    <td>{c.nombre_clinica}</td>
                    <td>{c.direccion}</td>
                    <td>{c.telefono || "-"}</td>
                    <td className="acciones">
                      <button className="btn-icon btn-edit" onClick={() => handleEditar(c)}>
                        ✏️
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => handleEliminar(c.id)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No hay clínicas registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Clinicas;
