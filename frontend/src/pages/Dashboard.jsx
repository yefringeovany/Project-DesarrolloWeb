import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { puedeGestionarPacientes, puedeGestionarClinicas } from "../utils/roles";

const Dashboard = () => {
  const { usuario, logoutUser } = useAuth();

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      {/* 🔹 Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-bold">
            🏥 Sistema de Gestión Médica
          </span>

          <div className="d-flex align-items-center">
            <span className="text-white me-3">
              👋 Hola, <strong>{usuario?.nombre}</strong> ({usuario?.rol})
            </span>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={logoutUser}
            >
              <i className="bi bi-box-arrow-right me-1"></i> Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      {/* 🔹 Contenido principal */}
      <div className="container my-5 flex-grow-1">
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">Panel Principal</h2>
          <p className="text-muted">
            Accede a las secciones según tus permisos de usuario
          </p>
        </div>

        <div className="row g-4 justify-content-center">
          {/* 🟢 Tarjeta Pacientes */}
          {puedeGestionarPacientes(usuario.rol) && (
            <div className="col-md-4">
              <div className="card border-0 shadow-lg h-100">
                <div className="card-body text-center">
                  <div className="mb-3 text-success">
                    <i
                      className="bi bi-people-fill"
                      style={{ fontSize: "3rem" }}
                    ></i>
                  </div>
                  <h5 className="fw-bold">Gestión de Pacientes</h5>
                  <Link to="/pacientes" className="btn btn-success mt-2">
                    <i className="bi bi-folder2-open me-2"></i> Ir
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 🔵 Tarjeta Clínicas */}
          {puedeGestionarClinicas(usuario.rol) && (
            <div className="col-md-4">
              <div className="card border-0 shadow-lg h-100">
                <div className="card-body text-center">
                  <div className="mb-3 text-info">
                    <i
                      className="bi bi-hospital"
                      style={{ fontSize: "3rem" }}
                    ></i>
                  </div>
                  <h5 className="fw-bold">Gestión de Clínicas</h5>
                  <Link
                    to="/clinicas"
                    className="btn btn-info mt-2 text-white"
                  >
                    <i className="bi bi-building-add me-2"></i> Ir
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 🕐 Tarjeta Crear Turno */}
          <div className="col-md-4">
            <div className="card border-0 shadow-lg h-100">
              <div className="card-body text-center">
                <div className="mb-3 text-primary">
                  <i
                    className="bi bi-clock-fill"
                    style={{ fontSize: "3rem" }}
                  ></i>
                </div>
                <h5 className="fw-bold">Crear Turno</h5>
                <Link to="/crear-turno" className="btn btn-primary mt-2">
                  <i className="bi bi-plus-circle me-2"></i> Ir
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Footer */}
      <footer className="bg-primary text-white text-center py-3 mt-auto">
        <small>
          © {new Date().getFullYear()} Sistema Médico - Todos los derechos
          reservados
        </small>
      </footer>
    </div>
  );
};

export default Dashboard;
