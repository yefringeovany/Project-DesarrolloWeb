import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

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
      if (Array.isArray(data.clinicas)) {
        setClinicas(data.clinicas);
      } else {
        setClinicas([]);
      }
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
          // ✅ Solo los médicos (rolId = 3) deben tener clínica asignada
          clinicaAsignadaId:
            rolId === "3" ? parseInt(clinicaAsignadaId) : null,
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
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "26rem" }}>
        <h3 className="text-center text-primary mb-4">Crear cuenta</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Nombre completo</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: Dr. Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              placeholder="tuemail@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Rol</label>
            <select
              className="form-select"
              value={rolId}
              onChange={(e) => setRolId(e.target.value)}
              required
            >
              <option value="">Seleccionar rol...</option>
              <option value="1">Administrador</option>
              <option value="2">Enfermero</option>
              <option value="3">Medico</option>
            </select>
          </div>

          {rolId === "3" && (
            <div className="mb-3">
              <label className="form-label fw-semibold">Clínica asignada</label>
              <select
                className="form-select"
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
            </div>
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

          <button type="submit" className="btn btn-success w-100">
            Registrarme
          </button>
        </form>

        <p className="text-center mt-3 text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link to="/" className="text-primary fw-bold">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
