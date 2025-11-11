import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Clinicas from "./pages/Clinicas";
import Turnos from "./pages/Turnos";
import CrearTurno from "./pages/CrearTurno";
import ProtectedRoute from "./components/ProtectedRoute";

// ✅ Evita acceso a login o register si ya hay usuario
const PublicRoute = ({ children }) => {
  const { usuario } = useAuth();
  return usuario ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    {/* PÚBLICAS (solo sin sesión) */}
    <Route
      path="/login"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />
    <Route
      path="/register"
      element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      }
    />

    {/* PRIVADAS */}
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
    <Route
      path="/crear-turno"
      element={
        <ProtectedRoute>
          <CrearTurno />
        </ProtectedRoute>
      }
    />

    {/* Redirección por defecto */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
