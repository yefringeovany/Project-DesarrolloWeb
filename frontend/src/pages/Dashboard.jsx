import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { puedeGestionarPacientes } from "../utils/roles";

const Dashboard = () => {
  const { usuario, logoutUser } = useAuth();

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">
            🏥 Sistema de Gestión Médica
          </span>

          <div className="d-flex align-items-center">
            <span className="text-white me-3">
              👋 Hola, <strong>{usuario?.nombre}</strong> ({usuario?.rol})
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={logoutUser}>
              <i className="bi bi-box-arrow-right me-1"></i> Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="container my-5 flex-grow-1">
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">Panel Principal</h2>
          <p className="text-muted">
            Accede a las secciones según tus permisos de usuario
          </p>
        </div>

        <div className="row g-4 justify-content-center">
          {/* Tarjeta Pacientes */}
          {puedeGestionarPacientes(usuario.rol) && (
            <div className="col-md-4">
              <div className="card border-0 shadow-lg h-100 hover-card">
                <div className="card-body text-center">
                  <div className="mb-3 text-success">
                    <i className="bi bi-people-fill" style={{ fontSize: "3rem" }}></i>
                  </div>
                  <h5 className="card-title fw-bold">Gestión de Pacientes</h5>
                  <p className="card-text text-muted">
                    Registra, consulta y administra la información de los pacientes.
                  </p>
                  <Link to="/pacientes" className="btn btn-success mt-2">
                    <i className="bi bi-folder2-open me-2"></i> Ir a Pacientes
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Tarjeta Perfil */}
          <div className="col-md-4">
            <div className="card border-0 shadow-lg h-100 hover-card">
              <div className="card-body text-center">
                <div className="mb-3 text-primary">
                  <i className="bi bi-person-circle" style={{ fontSize: "3rem" }}></i>
                </div>
                <h5 className="card-title fw-bold">Mi Perfil</h5>
                <p className="card-text text-muted">
                  Consulta tus datos de usuario y tu rol asignado en el sistema.
                </p>
                <button className="btn btn-primary mt-2" disabled>
                  <i className="bi bi-eye me-2"></i> Ver Perfil
                </button>
              </div>
            </div>
          </div>

          {/* Tarjeta Soporte */}
          <div className="col-md-4">
            <div className="card border-0 shadow-lg h-100 hover-card">
              <div className="card-body text-center">
                <div className="mb-3 text-warning">
                  <i className="bi bi-info-circle-fill" style={{ fontSize: "3rem" }}></i>
                </div>
                <h5 className="card-title fw-bold">Soporte</h5>
                <p className="card-text text-muted">
                  ¿Necesitas ayuda? Contacta con el equipo de soporte técnico.
                </p>
                <button className="btn btn-warning mt-2" disabled>
                  <i className="bi bi-envelope-fill me-2"></i> Contactar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary text-white text-center py-3 mt-auto">
        <small>© {new Date().getFullYear()} Sistema Médico - Todos los derechos reservados</small>
      </footer>
    </div>
  );
};

export default Dashboard;
