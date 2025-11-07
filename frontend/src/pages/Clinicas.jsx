import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { puedeGestionarClinicas } from "../utils/roles";

const Clinicas = () => {
  const { usuario } = useAuth();
  const [clinicas, setClinicas] = useState([]);
  const [form, setForm] = useState({ nombre_clinica: "", direccion: "", telefono: "" });
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const fetchClinicas = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/clinicas", {
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

    const url = editando
      ? `http://localhost:5000/api/clinicas/${editando}`
      : "http://localhost:5000/api/clinicas";
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
      const res = await fetch(`http://localhost:5000/api/clinicas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.mensaje || "Error al eliminar la clínica");
        return;
      }
      fetchClinicas();
    } catch (err) {
      console.error("Error al eliminar clínica:", err);
    }
  };

  return (
    <div className="container my-5">
      <h2 className="text-center text-primary mb-4">🏥 Gestión de Clínicas</h2>

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {/* Formulario solo visible para admin y enfermero */}
      {puedeGestionarClinicas(usuario.rol) && (
        <div className="card shadow p-4 mb-4">
          <h5 className="text-secondary mb-3">
            {editando ? "Editar Clínica" : "Registrar Nueva Clínica"}
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre de la clínica"
                  name="nombre_clinica"
                  value={form.nombre_clinica}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Dirección"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Teléfono"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-3 text-end">
              <button type="submit" className="btn btn-primary px-4">
                {editando ? "Actualizar" : "Registrar"}
              </button>
              {editando && (
                <button
                  type="button"
                  className="btn btn-secondary ms-2 px-4"
                  onClick={() => {
                    setForm({ nombre_clinica: "", direccion: "", telefono: "" });
                    setEditando(null);
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Listado de clínicas */}
      <div className="card shadow p-4">
        <h5 className="text-secondary mb-3">Lista de Clínicas</h5>

        {clinicas.length === 0 ? (
          <p className="text-center text-muted">No hay clínicas registradas.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Dirección</th>
                  <th>Teléfono</th>
                  {puedeGestionarClinicas(usuario.rol) && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {clinicas.map((c, i) => (
                  <tr key={c.id}>
                    <td>{i + 1}</td>
                    <td>{c.nombre_clinica}</td>
                    <td>{c.direccion}</td>
                    <td>{c.telefono || "-"}</td>
                    {puedeGestionarClinicas(usuario.rol) && (
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          {/* Botón Editar (admin + enfermero) */}
                          <button
                            onClick={() => handleEditar(c)}
                            className="btn btn-info btn-sm d-flex align-items-center px-3 rounded-pill shadow-sm"
                            style={{ transition: "all 0.2s ease", fontWeight: "500" }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                          >
                            <i className="bi bi-pencil-square me-2"></i>
                            <span className="d-none d-md-inline">Editar</span>
                          </button>

                          {/* Botón Eliminar (solo admin) */}
                          {usuario.rol === "admin" && (
                            <button
                              onClick={() => handleEliminar(c.id)}
                              className="btn btn-danger btn-sm d-flex align-items-center px-3 rounded-pill shadow-sm"
                              style={{ transition: "all 0.2s ease", fontWeight: "500" }}
                              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                            >
                              <i className="bi bi-trash3 me-2"></i>
                              <span className="d-none d-md-inline">Eliminar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clinicas;
