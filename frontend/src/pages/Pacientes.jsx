import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { obtenerPacientes, crearPaciente, eliminarPaciente } from "../api/pacientes";
import { puedeGestionarPacientes } from "../utils/roles";

const Pacientes = () => {
  const { usuario } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [form, setForm] = useState({ nombre: "", edad: "", genero: "", dpi: "", direccion: "" });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

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

    const data = await crearPaciente(token, form);
    if (data.paciente) {
      setMensaje("Paciente creado exitosamente.");
      setForm({ nombre: "", edad: "", genero: "", dpi: "", direccion: "" });
      cargarPacientes();
    } else {
      setError(data.mensaje || "Error al crear paciente.");
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este paciente?")) return;
    const data = await eliminarPaciente(token, id);
    setMensaje(data.mensaje);
    cargarPacientes();
  };

  if (!puedeGestionarPacientes(usuario.rol)) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning text-center">
          No tienes permiso para acceder al módulo de Pacientes.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="text-primary mb-4 text-center">Gestión de Pacientes</h2>

      {/* Formulario */}
      <div className="card shadow p-4 mb-4">
        <h5 className="mb-3">Registrar Paciente</h5>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Edad"
                name="edad"
                value={form.edad}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                name="genero"
                value={form.genero}
                onChange={handleChange}
              >
                <option value="">Género</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            <div className="col-md-2">
              <input
                type="text"
                className="form-control"
                placeholder="DPI"
                name="dpi"
                value={form.dpi}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-2">
              <input
                type="text"
                className="form-control"
                placeholder="Dirección"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
              />
            </div>
          </div>
          <button className="btn btn-success mt-3 w-100">Registrar</button>
        </form>

        {mensaje && <div className="alert alert-success mt-3">{mensaje}</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>

      {/* Tabla */}
      <div className="card shadow p-4">
        <h5>Lista de Pacientes</h5>
        <table className="table table-striped mt-3">
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
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleEliminar(p.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No hay pacientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Pacientes;
