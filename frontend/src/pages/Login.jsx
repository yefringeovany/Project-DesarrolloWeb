import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, LogIn, UserPlus, Activity } from "lucide-react";
import "../styles/Login.css"; // Importar los estilos

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser, usuario } = useAuth();

  // Si el usuario ya está autenticado, lo redirige directamente al Dashboard
  if (usuario) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.mensaje || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      // Guarda usuario y token en contexto/localStorage
      loginUser(data);

      // Navega al dashboard y reemplaza el historial (no puede volver atrás)
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("❌ Error en el login:", err);
      setError("Error de conexión con el servidor");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* PANEL IZQUIERDO */}
        <div className="auth-left">
          <div className="mb-4">
            <Activity size={60} className="mb-3" />
          </div>
          <h2>¡Bienvenido de vuelta! 👋</h2>
          <p>¿Aún no tienes una cuenta?</p>
          <Link to="/register">
            <button>
              <UserPlus size={20} className="me-2" style={{ display: 'inline' }} />
              Registrarse
            </button>
          </Link>
        </div>

        {/* PANEL DERECHO */}
        <div className="auth-right">
          <h3>Iniciar Sesión</h3>
          
          <form onSubmit={handleSubmit}>
            {/* Campo Email */}
            <div className="mb-3">
              <div className="position-relative">
                <Mail 
                  size={20} 
                  className="position-absolute text-muted" 
                  style={{ 
                    left: '15px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    zIndex: 10
                  }} 
                />
                <input
                  type="email"
                  className="form-control"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '45px' }}
                  required
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="mb-3">
              <div className="position-relative">
                <Lock 
                  size={20} 
                  className="position-absolute text-muted" 
                  style={{ 
                    left: '15px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    zIndex: 10
                  }} 
                />
                <input
                  type="password"
                  className="form-control"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '45px' }}
                  required
                />
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="alert alert-danger text-center">
                {error}
              </div>
            )}

            {/* Botón de submit */}
            <button 
              type="submit" 
              className="btn-gradient"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Ingresando...
                </>
              ) : (
                <>
                  <LogIn size={20} className="me-2" style={{ display: 'inline' }} />
                  Ingresar
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;