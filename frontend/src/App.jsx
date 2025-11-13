import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Clinicas from "./pages/Clinicas";
//import Turnos from "./pages/Turnos";
import CrearTurno from "./pages/CrearTurno";
import ColaMedico from "./pages/ColaMedico";
import PantallaPublica from "./pages/PantallaPublica";
import ProtectedRoute from "./components/ProtectedRoute";
import Usuarios from "./pages/Usuarios";
import HistorialTurnos from "./pages/HistorialTurnos";



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
  path="/historial-turnos"
  element={
    <ProtectedRoute>
      <HistorialTurnos />
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
  path="/usuarios"
  element={
    <ProtectedRoute>
      <Usuarios />
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
    
    {/* 🆕 RUTAS NUEVAS */}
    <Route
      path="/mi-cola"
      element={
        <ProtectedRoute>
          <ColaMedico />
        </ProtectedRoute>
      }
    />
    <Route
      path="/pantalla"
      element={
        <ProtectedRoute>
          <PantallaPublica />
        </ProtectedRoute>
      }
    />

    {/* Redirección por defecto */}
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
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