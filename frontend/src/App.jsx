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
          <Route
            path="/pacientes"
            element={
              <ProtectedRoute>
                <Pacientes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clinicas"
            element={
              <ProtectedRoute>
                <Clinicas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/turnos"
            element={
              <ProtectedRoute>
                <Turnos />
              </ProtectedRoute>
            }
          />
          <Route path="/pantalla" element={<PantallaPublica />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
