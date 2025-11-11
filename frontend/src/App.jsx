import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Pacientes from "./pages/Pacientes";
import Clinicas from "./pages/Clinicas";
import Turnos from "./pages/Turnos";
import PantallaPublica from "./pages/PantallaPublica";
import CrearTurno from "./pages/CrearTurno";
import ColaMedico from "./pages/ColaMedico"; // 👈 asegúrate de que el archivo exista

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Página principal: Login */}
          <Route path="/" element={<Login />} />

          {/* Página de registro */}
          <Route path="/register" element={<Register />} />

          {/* Dashboard protegido */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Pacientes */}
          <Route
            path="/pacientes"
            element={
              <ProtectedRoute>
                <Pacientes />
              </ProtectedRoute>
            }
          />

          {/* Clínicas */}
          <Route
            path="/clinicas"
            element={
              <ProtectedRoute>
                <Clinicas />
              </ProtectedRoute>
            }
          />

          {/* Turnos */}
          <Route
            path="/turnos"
            element={
              <ProtectedRoute>
                <Turnos />
              </ProtectedRoute>
            }
          />

          {/* Crear Turno */}
          <Route
            path="/crear-turno"
            element={
              <ProtectedRoute>
                <CrearTurno />
              </ProtectedRoute>
            }
          />

          {/* Mi Cola (médico) */}
          <Route
            path="/mi-cola"
            element={
              <ProtectedRoute>
                <ColaMedico />
              </ProtectedRoute>
            }
          />

          {/* Pantalla pública */}
          <Route path="/pantalla" element={<PantallaPublica />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
