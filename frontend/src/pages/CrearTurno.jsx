import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { puedeCrearTurnos } from "../utils/roles";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  Users,
  FileText,
  ArrowLeft,
} from "lucide-react";
import "../styles/CrearTurno.css";
import { useNavigate } from "react-router-dom";

const CrearTurno = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  // ================================
  // Estado y lógica del formulario
  // ================================
  const [formData, setFormData] = useState({
    pacienteId: "",
    clinicaId: "",
    motivo: "",
    prioridad: "normal",
  });
  const [pacientes, setPacientes] = useState([]);
  const [clinicas, setClinicas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [turnoCreado, setTurnoCreado] = useState(null);

  const API_URL = "http://localhost:5000/api";
  const token = localStorage.getItem("token");

  // ================================
  // Cargar datos iniciales
  // ================================
  const cargarDatos = async () => {
    setLoadingData(true);
    try {
      const [resPacientes, resClinicas] = await Promise.all([
        fetch(`${API_URL}/pacientes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/clinicas`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const dataPacientes = await resPacientes.json();
      const dataClinicas = await resClinicas.json();

      setPacientes(dataPacientes.pacientes || []);
      setClinicas(dataClinicas.clinicas || []);
    } catch (error) {
      mostrarMensaje("error", "Error al cargar los datos iniciales");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: "", texto: "" }), 4000);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pacienteId || !formData.clinicaId) {
      mostrarMensaje("error", "Por favor seleccione paciente y clínica");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/turnos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error al crear turno");

      setTurnoCreado(data.turno);
      mostrarMensaje("success", "Turno creado exitosamente ✅");
      setFormData({
        pacienteId: "",
        clinicaId: "",
        motivo: "",
        prioridad: "normal",
      });

      setTimeout(() => setTurnoCreado(null), 5000);
    } catch (error) {
      mostrarMensaje("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🚫 Validación de permisos
  if (!puedeCrearTurnos(usuario?.rol)) {
    return (
      <div className="no-access-container">
        <div className="text-center">
          <h4>🚫 Acceso Denegado</h4>
          <p>No tienes permisos para crear turnos.</p>
          <button
            className="btn-modern btn-back mt-3"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="me-1" /> Regresar al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de carga
  if (loadingData) {
    return (
      <div className="no-access-container">
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status"></div>
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  // ================================
  // Vista principal del formulario
  // ================================
  return (
    <div className="crear-turno-page">
      <div className="header-top">
        <button className="btn-modern btn-back" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="me-1" /> Regresar
        </button>
        <div className="crear-turno-header">
          <h2 className="titulo">Crear Nuevo Turno</h2>
          <p className="subtitulo">Gestione los turnos de pacientes fácilmente</p>
        </div>
      </div>

      <div className="glass-card">
        {/* Mensaje de alerta */}
        {mensaje.texto && (
          <div className={`alert ${mensaje.tipo}`}>
            {mensaje.tipo === "success" ? (
              <CheckCircle className="me-2" />
            ) : (
              <AlertCircle className="me-2" />
            )}
            {mensaje.texto}
          </div>
        )}

        {/* Turno creado */}
        {turnoCreado && (
          <div className="alert success">
            <h5 className="fw-bold mb-2">
              <CheckCircle className="me-2" /> ¡Turno Creado Exitosamente!
            </h5>
            <ul>
              <li><strong>Número:</strong> {turnoCreado.numeroTurno}</li>
              <li><strong>Paciente:</strong> {turnoCreado.paciente?.nombre}</li>
              <li><strong>Clínica:</strong> {turnoCreado.clinica?.nombre_clinica}</li>
              <li><strong>Estado:</strong> En espera</li>
            </ul>
          </div>
        )}

        {/* Formulario */}
        <form className="crear-turno-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <select
              value={formData.pacienteId}
              onChange={(e) => handleChange("pacienteId", e.target.value)}
            >
              <option value="">-- Seleccione un paciente --</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — DPI: {p.dpi}
                </option>
              ))}
            </select>

            <select
              value={formData.clinicaId}
              onChange={(e) => handleChange("clinicaId", e.target.value)}
            >
              <option value="">-- Seleccione una clínica --</option>
              {clinicas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre_clinica}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <textarea
              rows="3"
              placeholder="Motivo de consulta (opcional)"
              value={formData.motivo}
              onChange={(e) => handleChange("motivo", e.target.value)}
            />
          </div>

          <div className="form-row">
            {["normal", "urgente", "emergencia"].map((p) => (
              <button
                key={p}
                type="button"
                className={`btn-modern ${
                  formData.prioridad === p
                    ? p === "emergencia"
                      ? "btn-red"
                      : p === "urgente"
                      ? "btn-yellow"
                      : "btn-green"
                    : "btn-gray"
                }`}
                onClick={() => handleChange("prioridad", p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="form-row justify-end">
            <button
              type="submit"
              className="btn-modern btn-green"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Turno"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearTurno;
