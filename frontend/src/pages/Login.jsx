import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/AuthPage.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { loginUser, usuario } = useAuth();

  // 🔒 Si el usuario ya está autenticado, lo redirige directamente al Dashboard
  if (usuario) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.mensaje || "Error al iniciar sesión");
        return;
      }

      // ✅ Guarda usuario y token en contexto/localStorage
      loginUser(data);

      // ✅ Navega al dashboard y reemplaza el historial (no puede volver atrás)
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("❌ Error en el login:", err);
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* PANEL IZQUIERDO */}
        <div className="auth-left">
          <h2>Hola, ¡Bienvenido!</h2>
          <p>¿Aún no tienes una cuenta?</p>
          <Link to="/register">
            <button>Registrarse</button>
          </Link>
        </div>

        {/* PANEL DERECHO */}
        <div className="auth-right">
          <h3>Iniciar Sesión</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="alert alert-danger text-center">{error}</div>
            )}

            <button type="submit" className="btn-gradient">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
