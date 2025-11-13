import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  Clock,
  FileText,
  Activity,
  BarChart3,
  LogOut,
  Bell,
  Settings,
  ChevronRight,
  TrendingUp,
  Calendar,
  UserCheck,
  ClipboardList,
} from "lucide-react";
import { useState, useEffect } from "react";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { usuario, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const esAdmin = usuario?.rol?.toLowerCase() === "admin";
  const esEnfermero = usuario?.rol?.toLowerCase() === "enfermero";
  const esMedico = usuario?.rol?.toLowerCase() === "medico";

  const getRoleBadgeClass = () => {
    if (esAdmin) return "badge-admin";
    if (esEnfermero) return "badge-enfermero";
    return "badge-medico";
  };

  // === CARDS POR ROL ===
  const cardsMedico = [
    {
      title: "Mi Cola de Pacientes",
      description: "Ver y gestionar tus pacientes en espera",
      icon: Activity,
      gradient: "gradient-blue",
      route: "/mi-cola",
      badge: "Acceso Directo",
      badgeClass: "card-badge-blue",
    },
    {
      title: "Pantalla Pública",
      description: "Ver tablero de turnos en tiempo real",
      icon: BarChart3,
      gradient: "gradient-purple",
      route: "/pantalla",
      badge: "Visualización",
      badgeClass: "card-badge-purple",
    },
    {
      title: "Historial de Turnos",
      description: "Consulta el historial de tus atenciones médicas",
      icon: ClipboardList,
      gradient: "gradient-green",
      route: "/historial-turnos",
      badge: "Historial",
      badgeClass: "card-badge-green",
    },
  ];

  const cardsEnfermero = [
    {
      title: "Crear Turno",
      description: "Registrar nuevo turno para pacientes",
      icon: Clock,
      gradient: "gradient-green",
      route: "/crear-turno",
    },
    {
      title: "Pacientes",
      description: "Gestionar información de pacientes",
      icon: Users,
      gradient: "gradient-blue",
      route: "/pacientes",
    },
    {
      title: "Gestión de Turnos",
      description: "Administrar cola de turnos",
      icon: FileText,
      gradient: "gradient-orange",
      route: "/turnos",
    },
    {
  title: "Historial de Turnos",
  description: "Visualiza todos los turnos registrados en el sistema",
  icon: FileText,
  gradient: "gradient-orange",
  route: "/historial-turnos",
  badge: "Registro",
  badgeClass: "card-badge-orange"
}
  ];

  const cardsAdmin = [
    {
      title: "Gestión de Usuarios",
      description: "Ver, editar y eliminar usuarios del sistema",
      icon: Users,
      gradient: "gradient-red",
      route: "/usuarios",
      badge: "Solo Admin",
      badgeClass: "card-badge-red",
    },
    {
      title: "Pacientes",
      description: "Gestión completa de pacientes",
      icon: UserCheck,
      gradient: "gradient-blue",
      route: "/pacientes",
    },
    {
      title: "Clínicas",
      description: "Administrar clínicas del sistema",
      icon: Building2,
      gradient: "gradient-green",
      route: "/clinicas",
    },
    {
      title: "Crear Turno",
      description: "Registrar nuevo turno",
      icon: Clock,
      gradient: "gradient-purple",
      route: "/crear-turno",
    },
    {
  title: "Historial de Turnos",
  description: "Visualiza todos los turnos registrados en el sistema",
  icon: FileText,
  gradient: "gradient-orange",
  route: "/historial-turnos",
  badge: "Registro",
  badgeClass: "card-badge-orange"
}
  ];

  const cards = esMedico
    ? cardsMedico
    : esEnfermero
    ? cardsEnfermero
    : cardsAdmin;

  return (
    <div className="dashboard-container">
      {/* NAVBAR */}
      <nav className="navbar-glass">
        <div className="container-fluid px-4 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="logo-circle">
                <Activity size={24} className="text-primary" />
              </div>
              <div>
                <h5 className="mb-0 text-white fw-bold">Sistema de Turnos</h5>
                <small className="text-white-50">Gestión Médica Inteligente</small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              {/* RELOJ */}
              <div className="time-display d-none d-md-flex">
                <Calendar size={18} />
                <span className="fw-semibold">
                  {currentTime.toLocaleDateString("es-GT", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span className="opacity-75">|</span>
                <span className="fw-bold">
                  {currentTime.toLocaleTimeString("es-GT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* NOTIFICACIONES */}
              <button className="btn btn-link text-white position-relative p-2">
                <Bell size={22} />
                <span className="notification-badge">3</span>
              </button>

              {/* USUARIO */}
              <div className="user-info-pill">
                <div className="user-avatar">
                  {usuario?.nombre?.charAt(0).toUpperCase()}
                </div>
                <div className="d-none d-lg-block user-details">
                  <div className="fw-semibold" style={{ fontSize: "14px" }}>
                    {usuario?.nombre}
                  </div>
                  <div className="text-white-50" style={{ fontSize: "11px" }}>
                    {usuario?.rol}
                  </div>
                </div>
              </div>

              {/* LOGOUT */}
              <button
                className="btn btn-outline-light btn-sm px-3 py-2 rounded-pill"
                onClick={handleLogout}
              >
                <LogOut size={16} className="me-2" />
                <span className="d-none d-md-inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div className="container py-5">
        {/* HEADER */}
        <div className="welcome-section">
          <div className="welcome-avatar">
            <UserCheck size={40} className="text-primary" />
          </div>
          <h1 className="welcome-title">¡Bienvenido, {usuario?.nombre}! 👋</h1>
          <p className="welcome-subtitle">Panel de control principal</p>
          <div className="role-badge-container">
            <span className="text-muted">Tu rol:</span>
            <span className={`badge ${getRoleBadgeClass()}`}>
              {usuario?.rol}
            </span>
          </div>
        </div>

        {/* === CARDS === */}
        <div className="row g-4 mb-5 justify-content-center">
          {cards.map((card, index) => (
            <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3 card-col">
              <div
                className="card access-card h-100"
                onClick={() => {
                  if (card.title === "Pantalla Pública") {
                    window.open(card.route, "_blank");
                  } else {
                    navigate(card.route);
                  }
                }}
              >
                <div className={`card-gradient-decoration ${card.gradient}`} />
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className={`card-icon-circle ${card.gradient}`}>
                      <card.icon size={30} className="text-white" />
                    </div>
                    <h5 className="card-title fw-bold text-dark mb-2">
                      {card.title}
                    </h5>
                    <p className="card-text text-muted small mb-3">
                      {card.description}
                    </p>
                  </div>

                  {card.badge && (
                    <span className={`badge ${card.badgeClass}`}>
                      {card.badge}
                    </span>
                  )}

                  <div className="card-arrow-action mt-3">
                    <div className="card-arrow-circle">
                      <ChevronRight size={20} className="text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PANEL INFO */}
        <div className="card info-panel">
          <div className="card-body p-4">
            <div className="d-flex align-items-center mb-4">
              <div className="info-panel-header-icon">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">Información de la Sesión</h5>
                <small className="text-muted">
                  Detalles de tu cuenta activa
                </small>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <div className="info-card-item">
                  <div className="info-card-label">
                    <Users size={18} className="text-primary" /> USUARIO
                  </div>
                  <div className="fw-bold text-dark">{usuario?.nombre}</div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="info-card-item">
                  <div className="info-card-label">
                    <Settings size={18} className="text-primary" /> ROL
                  </div>
                  <div className="fw-bold text-dark">{usuario?.rol}</div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="info-card-item">
                  <div className="info-card-label">
                    <FileText size={18} className="text-primary" /> EMAIL
                  </div>
                  <div className="fw-bold text-dark text-truncate">
                    {usuario?.email}
                  </div>
                </div>
              </div>

              {usuario?.clinicaAsignadaId && (
                <div className="col-12">
                  <div className="info-card-item-clinica">
                    <div className="info-card-label">
                      <Building2 size={18} className="text-success" /> CLÍNICA
                      ASIGNADA
                    </div>
                    <div className="fw-bold text-dark">
                      {usuario?.Clinica?.nombre_clinica ||
                        `ID: ${usuario?.clinicaAsignadaId}`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
