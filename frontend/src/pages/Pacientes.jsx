import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // 👈 Importar useNavigate
import {
  obtenerPacientes,
  crearPaciente,
  eliminarPaciente,
  actualizarPaciente,
} from "../api/pacientes";
import { puedeGestionarPacientes } from "../utils/roles";
import "../styles/Paciente.css";

const Pacientes = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate(); // 👈 Hook para redirigir
  const [pacientes, setPacientes] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    edad: "",
    genero: "",
    dpi: "",
    direccion: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(null);
  const token = localStorage.getItem("token");

  const cargarPacientes = async () => {
    const data = await obtenerPacientes(token);
    if (data.pacientes) setPacientes(data.pacientes);
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (editando) {
      const data = await actualizarPaciente(token, editando.id, form);
      if (data.paciente) {
        setMensaje("✅ Paciente actualizado correctamente.");
        setEditando(null);
        setForm({ nombre: "", edad: "", genero: "", dpi: "", direccion: "" });
        cargarPacientes();
      } else {
        setError(data.mensaje || "Error al actualizar paciente.");
      }
    } else {
      const data = await crearPaciente(token, form);
      if (data.paciente) {
        setMensaje("✅ Paciente registrado correctamente.");
        setForm({ nombre: "", edad: "", genero: "", dpi: "", direccion: "" });
        cargarPacientes();
      } else {
        setError(data.mensaje || "Error al registrar paciente.");
      }
    }
  };

  const handleEditar = (paciente) => {
    setEditando(paciente);
    setForm({
      nombre: paciente.nombre,
      edad: paciente.edad,
      genero: paciente.genero,
      dpi: paciente.dpi,
      direccion: paciente.direccion,
    });
  };

  const handleCancelar = () => {
    setEditando(null);
    setForm({ nombre: "", edad: "", genero: "", dpi: "", direccion: "" });
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este paciente?")) return;
    const data = await eliminarPaciente(token, id);
    setMensaje(data.mensaje);
    cargarPacientes();
  };

  if (!puedeGestionarPacientes(usuario.rol)) {
    return (
      <div className="no-access-container">
        <div className="glass-card text-center p-5">
          <h3>🚫 Acceso Denegado</h3>
          <p>No tienes permisos para gestionar pacientes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pacientes-page">
      <header className="pacientes-header">
        <div className="header-top">
          <h1 className="titulo">👨‍⚕️ Gestión de Pacientes</h1>
          {/* 👇 Botón para regresar */}
          <button
            className="btn-modern btn-back"
            onClick={() => navigate("/dashboard")}
          >
            ← Regresar al Dashboard
          </button>
        </div>
        
      </header>

      <section className="glass-card form-card">
        <h4>{editando ? "✏️ Editar Paciente" : "🧍‍♂️ Registrar Paciente"}</h4>
        <form onSubmit={handleSubmit} className="paciente-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="Nombre completo"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              placeholder="Edad"
              name="edad"
              value={form.edad}
              onChange={handleChange}
              required
            />
            <select
              name="genero"
              value={form.genero}
              onChange={handleChange}
              required
            >
              <option value="">Género</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
          <div className="form-row">
            <input
              type="text"
              placeholder="DPI"
              name="dpi"
              value={form.dpi}
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Dirección"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
            />
          </div>

          <div className="botones-form">
            <button type="submit" className="btn-modern btn-green">
              {editando ? "Actualizar Paciente" : "Registrar Paciente"}
            </button>
            {editando && (
              <button
                type="button"
                className="btn-modern btn-gray"
                onClick={handleCancelar}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {mensaje && <div className="alert success">{mensaje}</div>}
        {error && <div className="alert error">{error}</div>}
      </section>

      <section className="glass-card tabla-card">
        <h4>📋 Lista de Pacientes</h4>
        <div className="tabla-container">
          <table className="pacientes-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Edad</th>
                <th>Género</th>
                <th>DPI</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.length > 0 ? (
                pacientes.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nombre}</td>
                    <td>{p.edad}</td>
                    <td>{p.genero}</td>
                    <td>{p.dpi}</td>
                    <td>{p.direccion}</td>
                    <td className="acciones">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEditar(p)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleEliminar(p.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No hay pacientes registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Pacientes;
