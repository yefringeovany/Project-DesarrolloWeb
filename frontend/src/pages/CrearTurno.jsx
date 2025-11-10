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
} from "lucide-react";

const CrearTurno = () => {
  const { usuario } = useAuth();

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

  // ================================
  // 🚫 Validación de permisos
  // ================================
  if (!puedeCrearTurnos(usuario?.rol)) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center">
          <div className="alert alert-danger shadow-lg">
            <h4 className="fw-bold mb-2">🚫 Acceso Denegado</h4>
            <p>No tienes permisos para crear turnos.</p>
            <a href="/dashboard" className="btn btn-primary mt-3">
              Volver al Panel Principal
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ================================
  // Pantalla de carga
  // ================================
  if (loadingData) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="text-muted">Cargando datos...</p>
        </div>
      </div>
    );
  }

  // ================================
  // Vista principal del formulario
  // ================================
  return (
    <div className="container py-5">
      <div className="card shadow-lg border-0">
        <div className="card-header bg-primary text-white d-flex align-items-center">
          <Clock className="me-2" /> <h4 className="mb-0">Crear Nuevo Turno</h4>
        </div>

        <div className="card-body">
          {/* Mensaje de alerta */}
          {mensaje.texto && (
            <div
              className={`alert d-flex align-items-center ${
                mensaje.tipo === "success" ? "alert-success" : "alert-danger"
              }`}
              role="alert"
            >
              {mensaje.tipo === "success" ? (
                <CheckCircle className="me-2" />
              ) : (
                <AlertCircle className="me-2" />
              )}
              <div>{mensaje.texto}</div>
            </div>
          )}

          {/* Turno creado */}
          {turnoCreado && (
            <div className="alert alert-success border-success">
              <h5 className="fw-bold mb-2">
                <CheckCircle className="me-2" /> ¡Turno Creado Exitosamente!
              </h5>
              <ul className="mb-0">
                <li>
                  <strong>Número de Turno:</strong> {turnoCreado.numeroTurno}
                </li>
                <li>
                  <strong>Paciente:</strong> {turnoCreado.paciente?.nombre}
                </li>
                <li>
                  <strong>Clínica:</strong> {turnoCreado.clinica?.nombre_clinica}
                </li>
                <li>
                  <strong>Estado:</strong>{" "}
                  <span className="badge bg-warning text-dark">En espera</span>
                </li>
              </ul>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                <Users className="me-1" /> Seleccionar Paciente *
              </label>
              <select
                className="form-select"
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
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                <Building2 className="me-1" /> Seleccionar Clínica *
              </label>
              <select
                className="form-select"
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

            <div className="mb-3">
              <label className="form-label fw-semibold">
                <AlertCircle className="me-1" /> Nivel de Prioridad
              </label>
              <div className="d-flex gap-2 flex-wrap">
                {["normal", "urgente", "emergencia"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`btn ${
                      formData.prioridad === p
                        ? p === "normal"
                          ? "btn-outline-secondary"
                          : p === "urgente"
                          ? "btn-outline-warning"
                          : "btn-outline-danger"
                        : "btn-light border"
                    }`}
                    onClick={() => handleChange("prioridad", p)}
                  >
                    {p === "emergencia" && "🚨 "}
                    {p === "urgente" && "⚠️ "}
                    {p === "normal" && "✓ "}
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                <FileText className="me-1" /> Motivo de Consulta (opcional)
              </label>
              <textarea
                className="form-control"
                rows="3"
                maxLength="500"
                placeholder="Descripción breve..."
                value={formData.motivo}
                onChange={(e) => handleChange("motivo", e.target.value)}
              />
              <small className="text-muted">
                {formData.motivo.length}/500 caracteres
              </small>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  setFormData({
                    pacienteId: "",
                    clinicaId: "",
                    motivo: "",
                    prioridad: "normal",
                  })
                }
              >
                Limpiar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="me-1" /> Crear Turno
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Info */}
      <div className="alert alert-info mt-4">
        <h6 className="fw-bold mb-2">
          <AlertCircle className="me-2" />
          Información importante
        </h6>
        <ul className="mb-0 ps-3">
          <li>El turno se asignará automáticamente a la cola de espera.</li>
          <li>El número de turno se genera automáticamente.</li>
          <li>El turno aparecerá en tiempo real en la pantalla pública.</li>
          <li>Los turnos de emergencia tienen prioridad máxima.</li>
        </ul>
      </div>
    </div>
  );
};

export default CrearTurno;
