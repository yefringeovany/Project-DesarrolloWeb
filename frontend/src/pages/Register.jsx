import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/AuthPage.css";

const Register = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rolId, setRolId] = useState("");
  const [clinicaAsignadaId, setClinicaAsignadaId] = useState("");
  const [clinicas, setClinicas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/clinicas")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.clinicas)) setClinicas(data.clinicas);
      })
      .catch(() => setClinicas([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          password,
          rolId: parseInt(rolId),
          clinicaAsignadaId: rolId === "3" ? parseInt(clinicaAsignadaId) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMensaje(data.mensaje || "Error al registrar");
        return;
      }

      setMensaje("✅ Registro exitoso 🎉 Redirigiendo...");
      setTimeout(() => navigate("/"), 1500);
    } catch {
      setMensaje("Error de conexión con el servidor");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* PANEL DERECHO (FORMULARIO) */}
        <div className="auth-right">
          <h3>Registro</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />

            <input
              type="email"
              className="form-control mb-3"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              className="form-control mb-3"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <select
              className="form-select mb-3"
              value={rolId}
              onChange={(e) => setRolId(e.target.value)}
              required
            >
              <option value="">Seleccionar rol...</option>
              <option value="1">Administrador</option>
              <option value="2">Enfermero</option>
              <option value="3">Médico</option>
            </select>

            {rolId === "3" && (
              <select
                className="form-select mb-3"
                value={clinicaAsignadaId}
                onChange={(e) => setClinicaAsignadaId(e.target.value)}
                required
              >
                <option value="">Seleccionar clínica...</option>
                {clinicas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre_clinica}
                  </option>
                ))}
              </select>
            )}

            {mensaje && (
              <div
                className={`alert ${
                  mensaje.includes("✅") ? "alert-success" : "alert-danger"
                } text-center`}
              >
                {mensaje}
              </div>
            )}

            <button type="submit" className="btn-gradient">
           Registrarme
            </button>        
          </form>
        </div>

        {/* PANEL IZQUIERDO */}
        <div className="auth-left">
          <h2>¡Bienvenido de nuevo!</h2>
          <p>¿Ya tienes cuenta?</p>
          <Link to="/">
            <button>Iniciar sesión</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
