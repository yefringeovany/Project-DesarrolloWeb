import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useSocket from "../hooks/useSocket";

const Turnos = () => {
  const { usuario } = useAuth();
  const token = localStorage.getItem("token");
  
  // Estado
  const [clinicas, setClinicas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [clinicaSeleccionada, setClinicaSeleccionada] = useState("");
  const [turnos, setTurnos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Formulario para crear turno
  const [form, setForm] = useState({
    pacienteId: "",
    clinicaId: "",
    motivo: "",
    prioridad: "normal",
  });

  // 🔥 WebSocket Hook
  const { socket, isConnected } = useSocket('http://localhost:5000', true);

  // ========================================
  // 📡 CONFIGURAR EVENTOS DE SOCKET.IO
  // ========================================
  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log('🔔 Configurando listeners de Socket.IO...');

    // Evento: Nuevo turno creado
    socket.on('turno:nuevo', (turno) => {
      console.log('🆕 Nuevo turno recibido:', turno);
      
      // Si el turno es de la clínica actual, agregarlo
      if (turno.clinicaId === parseInt(clinicaSeleccionada)) {
        setTurnos((prev) => [turno, ...prev]);
        setMensaje(`Nuevo turno: ${turno.numeroTurno}`);
        setTimeout(() => setMensaje(""), 3000);
      }
    });

    // Evento: Cambio de estado de turno
    socket.on('turno:cambioEstado', (data) => {
      console.log('🔄 Cambio de estado:', data);
      
      setTurnos((prev) =>
        prev.map((t) =>
          t.id === data.id ? { ...t, ...data } : t
        )
      );
    });

    // Evento: Turno actualizado
    socket.on('turno:actualizado', (turno) => {
      console.log('♻️ Turno actualizado:', turno);
      
      setTurnos((prev) =>
        prev.map((t) => (t.id === turno.id ? turno : t))
      );
    });

    // Evento: Turno siendo llamado
    socket.on('turno:llamando', (data) => {
      console.log('📢 Turno llamando:', data);
      
      if (data.turno.clinicaId === parseInt(clinicaSeleccionada)) {
        // Mostrar notificación o alerta
        setMensaje(`🔔 ${data.mensaje}`);
        setTimeout(() => setMensaje(""), 5000);
      }
    });

    // Cleanup
    return () => {
      socket.off('turno:nuevo');
      socket.off('turno:cambioEstado');
      socket.off('turno:actualizado');
      socket.off('turno:llamando');
    };
  }, [socket, isConnected, clinicaSeleccionada]);

  // ========================================
  // 🏥 UNIRSE A SALA DE CLÍNICA
  // ========================================
  useEffect(() => {
    if (!socket || !isConnected || !clinicaSeleccionada) return;

    console.log(`🏥 Uniéndose a sala: clinica-${clinicaSeleccionada}`);
    socket.emit('join:clinica', clinicaSeleccionada);

    socket.on('joined:clinica', (data) => {
      console.log('✅ Unido a clínica:', data);
    });

    return () => {
      console.log(`🚪 Saliendo de sala: clinica-${clinicaSeleccionada}`);
      socket.emit('leave:clinica', clinicaSeleccionada);
    };
  }, [socket, isConnected, clinicaSeleccionada]);

  // ========================================
  // 📋 CARGAR DATOS INICIALES
  // ========================================
  useEffect(() => {
    cargarClinicas();
    cargarPacientes();
  }, []);

  useEffect(() => {
    if (clinicaSeleccionada) {
      cargarTurnos();
      cargarEstadisticas();
    }
  }, [clinicaSeleccionada]);

  // ========================================
  // 🌐 FUNCIONES DE API
  // ========================================
  const cargarClinicas = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/clinicas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClinicas(data.clinicas || []);
    } catch (err) {
      console.error("Error al cargar clínicas:", err);
    }
  };

  const cargarPacientes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/pacientes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPacientes(data.pacientes || []);
    } catch (err) {
      console.error("Error al cargar pacientes:", err);
    }
  };

  const cargarTurnos = async () => {
    if (!clinicaSeleccionada) return;

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/turnos/clinica/${clinicaSeleccionada}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setTurnos(data.turnos || []);
    } catch (err) {
      console.error("Error al cargar turnos:", err);
      setError("No se pudieron cargar los turnos");
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    if (!clinicaSeleccionada) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/turnos/clinica/${clinicaSeleccionada}/estadisticas`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setEstadisticas(data.estadisticas);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    }
  };

  // ========================================
  // 📝 CREAR TURNO
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    // Validar que sea enfermero o admin
    if (!["enfermero", "admin"].includes(usuario.rol.toLowerCase())) {
      setError("Solo enfermero o administrador pueden crear turnos.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/turnos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.mensaje || "Error al crear turno");
        return;
      }

      setMensaje("✅ Turno creado exitosamente");
      setForm({
        pacienteId: "",
        clinicaId: "",
        motivo: "",
        prioridad: "normal",
      });

      // Los turnos se actualizarán automáticamente vía WebSocket
    } catch (err) {
      console.error("Error al crear turno:", err);
      setError("Error de conexión con el servidor");
    }
  };

  // ========================================
  // 🔄 CAMBIAR ESTADO DE TURNO
  // ========================================
  const cambiarEstado = async (turnoId, nuevoEstado, observaciones = "") => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/turnos/${turnoId}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nuevoEstado, observaciones }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.mensaje || "Error al cambiar estado");
        return;
      }

      setMensaje(`Estado cambiado a: ${nuevoEstado}`);
      setTimeout(() => setMensaje(""), 3000);

      // El turno se actualizará automáticamente vía WebSocket
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setError("Error de conexión con el servidor");
    }
  };

  // ========================================
  // 🎨 UTILIDADES DE UI
  // ========================================
  const getEstadoBadge = (estado) => {
    const badges = {
      espera: "badge bg-warning",
      llamando: "badge bg-info",
      atendiendo: "badge bg-primary",
      finalizado: "badge bg-success",
      ausente: "badge bg-secondary",
      cancelado: "badge bg-danger",
    };
    return badges[estado] || "badge bg-secondary";
  };

  const getPrioridadBadge = (prioridad) => {
    const badges = {
      normal: "badge bg-secondary",
      urgente: "badge bg-warning",
      emergencia: "badge bg-danger",
    };
    return badges[prioridad] || "badge bg-secondary";
  };

  // ========================================
  // 🎯 RENDER
  // ========================================
  return (
    <div className="container my-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">
          📋 Gestión de Turnos
          {isConnected && (
            <span className="badge bg-success ms-3">● En tiempo real</span>
          )}
          {!isConnected && (
            <span className="badge bg-danger ms-3">● Desconectado</span>
          )}
        </h2>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div className="alert alert-info alert-dismissible fade show">
          {mensaje}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMensaje("")}
          ></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {/* Formulario de creación (solo enfermero/admin) */}
      {["enfermero", "admin"].includes(usuario.rol.toLowerCase()) && (
        <div className="card shadow p-4 mb-4">
          <h5 className="mb-3">🆕 Crear Nuevo Turno</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Paciente</label>
                <select
                  className="form-select"
                  value={form.pacienteId}
                  onChange={(e) =>
                    setForm({ ...form, pacienteId: e.target.value })
                  }
                  required
                >
                  <option value="">Seleccionar...</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} - {p.dpi}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Clínica</label>
                <select
                  className="form-select"
                  value={form.clinicaId}
                  onChange={(e) =>
                    setForm({ ...form, clinicaId: e.target.value })
                  }
                  required
                >
                  <option value="">Seleccionar...</option>
                  {clinicas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre_clinica}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">Prioridad</label>
                <select
                  className="form-select"
                  value={form.prioridad}
                  onChange={(e) =>
                    setForm({ ...form, prioridad: e.target.value })
                  }
                >
                  <option value="normal">Normal</option>
                  <option value="urgente">Urgente</option>
                  <option value="emergencia">Emergencia</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Motivo</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Motivo de consulta..."
                  value={form.motivo}
                  onChange={(e) =>
                    setForm({ ...form, motivo: e.target.value })
                  }
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-3">
              ✅ Registrar Turno
            </button>
          </form>
        </div>
      )}

      {/* Selector de Clínica */}
      <div className="card shadow p-3 mb-4">
        <div className="row align-items-center">
          <div className="col-md-6">
            <label className="form-label fw-bold">
              🏥 Seleccionar Clínica:
            </label>
            <select
              className="form-select"
              value={clinicaSeleccionada}
              onChange={(e) => setClinicaSeleccionada(e.target.value)}
            >
              <option value="">-- Todas --</option>
              {clinicas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre_clinica}
                </option>
              ))}
            </select>
          </div>

          {/* Estadísticas */}
          {estadisticas && (
            <div className="col-md-6">
              <div className="row g-2 text-center">
                <div className="col">
                  <div className="bg-warning bg-opacity-10 p-2 rounded">
                    <strong className="d-block">{estadisticas.enEspera}</strong>
                    <small>En Espera</small>
                  </div>
                </div>
                <div className="col">
                  <div className="bg-primary bg-opacity-10 p-2 rounded">
                    <strong className="d-block">
                      {estadisticas.atendiendo}
                    </strong>
                    <small>Atendiendo</small>
                  </div>
                </div>
                <div className="col">
                  <div className="bg-success bg-opacity-10 p-2 rounded">
                    <strong className="d-block">
                      {estadisticas.finalizados}
                    </strong>
                    <small>Finalizados</small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Turnos */}
      <div className="card shadow p-4">
        <h5 className="mb-3">
          📋 Cola de Turnos
          {clinicaSeleccionada && ` - ${
            clinicas.find((c) => c.id === parseInt(clinicaSeleccionada))
              ?.nombre_clinica || ""
          }`}
        </h5>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : turnos.length === 0 ? (
          <p className="text-center text-muted py-4">
            No hay turnos en la cola.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>N° Turno</th>
                  <th>Paciente</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Hora Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {turnos.map((turno) => (
                  <tr key={turno.id}>
                    <td>
                      <strong className="text-primary">
                        {turno.numeroTurno}
                      </strong>
                    </td>
                    <td>{turno.paciente?.nombre || "N/A"}</td>
                    <td>
                      <span className={getPrioridadBadge(turno.prioridad)}>
                        {turno.prioridad}
                      </span>
                    </td>
                    <td>
                      <span className={getEstadoBadge(turno.estado)}>
                        {turno.estado}
                      </span>
                    </td>
                    <td>
                      {new Date(turno.horaRegistro).toLocaleTimeString()}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        {turno.estado === "espera" && (
                          <button
                            className="btn btn-info"
                            onClick={() => cambiarEstado(turno.id, "llamando")}
                          >
                            📢 Llamar
                          </button>
                        )}

                        {turno.estado === "llamando" && (
                          <button
                            className="btn btn-primary"
                            onClick={() =>
                              cambiarEstado(turno.id, "atendiendo")
                            }
                          >
                            ⚕️ Atender
                          </button>
                        )}

                        {turno.estado === "atendiendo" && (
                          <button
                            className="btn btn-success"
                            onClick={() =>
                              cambiarEstado(turno.id, "finalizado")
                            }
                          >
                            ✅ Finalizar
                          </button>
                        )}

                        {["espera", "llamando"].includes(turno.estado) && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => cambiarEstado(turno.id, "ausente")}
                          >
                            ❌ Ausente
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Turnos;