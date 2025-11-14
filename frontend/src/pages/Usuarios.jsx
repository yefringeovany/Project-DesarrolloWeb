import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Usuarios.css";

const Usuarios = () => {
  const { usuario, token } = useAuth();
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rolId: "",
  });

  // === CARGAR USUARIOS ===
  const cargarUsuarios = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(res.data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setError("No se pudieron cargar los usuarios.");
    }
  };

  // === CARGAR ROLES ===
  const cargarRoles = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al obtener roles:", err);
      setRoles([]);
    }
  };

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  // === HANDLERS ===
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditar = (u) => {
    setEditando(u);
    setForm({
      nombre: u.nombre,
      email: u.email,
      password: "",
      rolId: u.rolId || "",
    });
  };

  const handleCancelar = () => {
    setEditando(null);
    setForm({ nombre: "", email: "", password: "", rolId: "" });
  };

  // === CREAR O ACTUALIZAR ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      if (editando) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/usuarios/${editando.id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMensaje("✅ Usuario actualizado correctamente.");
      } else {
        await axios.post( `${import.meta.env.VITE_API_URL}/api/usuarios`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMensaje("✅ Usuario creado correctamente.");
      }
      setEditando(null);
      setForm({ nombre: "", email: "", password: "", rolId: "" });
      cargarUsuarios();
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      setError("Error al guardar usuario.");
    }
  };

  // === ELIMINAR ===
  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensaje("🗑️ Usuario eliminado correctamente.");
      cargarUsuarios();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setError("Error al eliminar usuario.");
    }
  };

  return (
    <div className="usuarios-page">
      <header className="usuarios-header">
        <div className="header-top">
          <h1 className="titulo">👥 Gestión de Usuarios</h1>
          <button className="btn-modern btn-back" onClick={() => navigate("/dashboard")}>
            ← Regresar al Dashboard
          </button>
        </div>
      </header>

      <section className="glass-card form-card">
        <h4>{editando ? "✏️ Editar Usuario" : "➕ Registrar Usuario"}</h4>
        <form onSubmit={handleSubmit} className="usuario-form">
          <div className="form-row">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              required={!editando}
            />
            <select name="rolId" value={form.rolId} onChange={handleChange} required>
              <option value="">Seleccionar Rol</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre_rol}
                </option>
              ))}
            </select>
          </div>

          <div className="botones-form">
            <button type="submit" className="btn-modern btn-green">
              {editando ? "Actualizar Usuario" : "Registrar Usuario"}
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
        <h4>📋 Lista de Usuarios</h4>
        <div className="tabla-container">
          <table className="usuarios-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length > 0 ? (
                usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>{u.Rol ? u.Rol.nombre_rol : "Sin rol"}</td>
                    <td className="acciones">
                      <button className="btn-icon btn-edit" onClick={() => handleEditar(u)}>
                        ✏️
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => eliminarUsuario(u.id)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No hay usuarios registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Usuarios;
