import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  Clock,
  FileText,
  Activity,
  BarChart3,
  LogOut
} from "lucide-react";

const Dashboard = () => {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    cerrarSesion();
    navigate("/");
  };

  // Verificar rol para mostrar opciones específicas
  const esAdmin = usuario?.rol?.toLowerCase() === "admin";
  const esEnfermero = usuario?.rol?.toLowerCase() === "enfermero";
  const esMedico = usuario?.rol?.toLowerCase() === "medico";

  return (
    <div className="min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-primary shadow">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            🏥 Sistema de Gestión de Turnos
          </span>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white">
              👤 {usuario?.nombre} ({usuario?.rol})
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              <LogOut size={18} className="me-1" style={{ display: 'inline-block' }} />
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-primary">
            Bienvenido, {usuario?.nombre}
          </h1>
          <p className="lead text-muted">
            Panel de control - Rol: <span className="badge bg-primary">{usuario?.rol}</span>
          </p>
        </div>

        {/* Cards de acceso rápido */}
        <div className="row g-4">
          {/* MÉDICO - Vista específica */}
          {esMedico && (
            <>
              <div className="col-md-6">
                <div
                  className="card shadow-lg border-0 h-100 hover-card"
                  onClick={() => navigate("/mi-cola")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body text-center p-5">
                    <div className="mb-4">
                      <Activity size={64} className="text-primary" />
                    </div>
                    <h3 className="card-title">Mi Cola de Pacientes</h3>
                    <p className="card-text text-muted">
                      Ver y gestionar tus pacientes en espera
                    </p>
                    <span className="badge bg-primary px-3 py-2">
                      Acceso Directo
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div
                  className="card shadow-lg border-0 h-100 hover-card"
                  onClick={() => navigate("/pantalla")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body text-center p-5">
                    <div className="mb-4">
                      <BarChart3 size={64} className="text-info" />
                    </div>
                    <h3 className="card-title">Pantalla Pública</h3>
                    <p className="card-text text-muted">
                      Ver tablero de turnos en tiempo real
                    </p>
                    <span className="badge bg-info px-3 py-2">
                      Visualización
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ENFERMERO - Vista específica */}
          {esEnfermero && (
            <>
              <div className="col-md-4">
                <div
                  className="card shadow-lg border-0 h-100 hover-card"
                  onClick={() => navigate("/crear-turno")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <Clock size={48} className="text-success" />
                    </div>
                    <h4 className="card-title">Crear Turno</h4>
                    <p className="card-text text-muted">
                      Registrar nuevo turno para pacientes
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div
                  className="card shadow-lg border-0 h-100 hover-card"
                  onClick={() => navigate("/pacientes")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <Users size={48} className="text-primary" />
                    </div>
                    <h4 className="card-title">Pacientes</h4>
                    <p className="card-text text-muted">
                      Gestionar información de pacientes
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div
                  className="card shadow-lg border-0 h-100 hover-card"
                  onClick={() => navigate("/turnos")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <FileText size={48} className="text-warning" />
                    </div>
                    <h4 className="card-title">Gestión de Turnos</h4>
                    <p className="card-text text-muted">
                      Administrar cola de turnos
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ADMIN - Acceso completo */}
          {esAdmin && (
            <>
              <div className="col-md-3">
                <div
                  className="card shadow-lg border-0 h-100 hover-card"
                  onClick={() => navigate("/pacientes")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <Users size={48} className="text-primary" />
                    </div>
                    <h5 className="card-title">Pacientes</h5>
                    <p className="card-text text-muted small">
                      Gestión de pacientes
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div
                  className="card shadow-lg border-0 h-100 hover-card"
                  onClick={() => navigate("/clinicas")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <Building2 size={48} className="text-success" />
                    </div>
                    <h5 className="card-title">Clínicas</h5>
                    <p className="card-text text-muted small">
                      Administrar clínicas
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div
                  className="card shadow-lg border-0 h-100 hover-card"
                  onClick={() => navigate("/turnos")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <FileText size={48} className="text-warning" />
                    </div>
                    <h5 className="card-title">Turnos</h5>
                    <p className="card-text text-muted small">
                      Gestión de turnos
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div
                  className="card shadow-lg border-0 h-100 hover-card"
                  onClick={() => navigate("/crear-turno")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <Clock size={48} className="text-info" />
                    </div>
                    <h5 className="card-title">Crear Turno</h5>
                    <p className="card-text text-muted small">
                      Nuevo turno
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Información adicional */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">ℹ️ Información del Sistema</h5>
                <div className="row g-3 mt-2">
                  <div className="col-md-4">
                    <div className="border rounded p-3 bg-light">
                      <strong>👤 Usuario:</strong> {usuario?.nombre}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded p-3 bg-light">
                      <strong>🎭 Rol:</strong> {usuario?.rol}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded p-3 bg-light">
                      <strong>📧 Email:</strong> {usuario?.email}
                    </div>
                  </div>
                  {usuario?.clinicaAsignadaId && (
                    <div className="col-12">
                      <div className="border rounded p-3 bg-primary bg-opacity-10">
                        <strong>🏥 Clínica Asignada:</strong> {usuario?.Clinica?.nombre_clinica || `ID: ${usuario?.clinicaAsignadaId}`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos personalizados */}
      <style>{`
        .hover-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;