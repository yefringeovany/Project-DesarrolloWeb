import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import {
  Clock,
  User,
  CheckCircle,
  Phone,
  Stethoscope,
  Archive,
} from "lucide-react";

const ColaMedico = () => {
  const { usuario, token } = useAuth();
  const [cola, setCola] = useState({ turnos: { enEspera: [], llamando: [], atendiendo: [] } });
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirigir si no es médico
  if (usuario?.rol !== "medico") return <Navigate to="/" replace />;

  // ==============================
  // Obtener cola del médico
  // ==============================
  const obtenerCola = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/turnos/mi-cola", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al obtener la cola");
      const data = await res.json();

      // Filtrar pacientes asignados a la misma clínica del médico
      const pacientesClinica = [
        ...data.turnos.enEspera,
        ...data.turnos.llamando,
        ...data.turnos.atendiendo,
      ].filter((t) => t.paciente.clinicaId === usuario.clinicaAsignadaId);

      // Actualizar historial (evitar duplicados)
      setHistorial((prev) => {
        const nuevos = pacientesClinica.filter(
          (t) => !prev.find((p) => p.id === t.id)
        );
        return [...nuevos, ...prev];
      });

      setCola(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la cola de turnos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerCola();
    const interval = setInterval(obtenerCola, 15000); // refresca cada 15s
    return () => clearInterval(interval);
  }, []);

  // ==============================
  // Función genérica para actualizar turno
  // ==============================
  const actualizarTurno = async (url, body) => {
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al actualizar el turno");
      await obtenerCola();
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al actualizar el turno.");
    }
  };

  const llamarSiguiente = (id) =>
    actualizarTurno(`http://localhost:5000/api/turnos/${id}/estado`, {
      nuevoEstado: "llamando",
      observaciones: "Paciente, por favor pase a la clínica",
    });

  const iniciarAtencion = (id) =>
    actualizarTurno(`http://localhost:5000/api/turnos/${id}/iniciar-atencion`, {
      observaciones: "Iniciando consulta",
    });

  const finalizarAtencion = (id) =>
    actualizarTurno(`http://localhost:5000/api/turnos/${id}/finalizar-atencion`, {
      observaciones: "Consulta finalizada",
    });

  // ==============================
  // Renderización
  // ==============================
  const { enEspera, llamando, atendiendo } = cola.turnos;

  if (loading) return <div className="text-center mt-5">Cargando turnos...</div>;
  if (error) return <div className="alert alert-danger text-center mt-3">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-3 text-center">
        <Stethoscope className="me-2" />
        Cola de Turnos - {usuario.nombre}
      </h2>

      {/* ---------------- EN ESPERA ---------------- */}
      <SeccionTurnos
        titulo="En Espera"
        color="secondary"
        turnos={enEspera}
        boton={(turno) => (
          <button
            onClick={() => llamarSiguiente(turno.id)}
            className="btn btn-sm btn-warning mt-2"
          >
            <Phone className="me-1" /> Llamar
          </button>
        )}
      />

      {/* ---------------- LLAMANDO ---------------- */}
      <SeccionTurnos
        titulo="Llamando"
        color="info"
        turnos={llamando}
        boton={(turno) => (
          <button
            onClick={() => iniciarAtencion(turno.id)}
            className="btn btn-sm btn-success mt-2"
          >
            <Stethoscope className="me-1" /> Iniciar Atención
          </button>
        )}
      />

      {/* ---------------- ATENDIENDO ---------------- */}
      <SeccionTurnos
        titulo="Atendiendo"
        color="success"
        turnos={atendiendo}
        boton={(turno) => (
          <button
            onClick={() => finalizarAtencion(turno.id)}
            className="btn btn-sm btn-danger mt-2"
          >
            Finalizar Atención
          </button>
        )}
      />

      {/* ---------------- HISTORIAL ---------------- */}
      <section className="mt-5">
        <h4 className="text-muted mb-2">
          <Archive className="me-2" /> Historial de Pacientes
        </h4>
        {historial.length === 0 ? (
          <p>No hay historial de pacientes aún.</p>
        ) : (
          historial.map((turno) => (
            <div key={turno.id} className="card p-2 mb-2 shadow-sm">
              <strong>{turno.paciente.nombre}</strong> - Estado:{" "}
              <span className={`badge bg-${
                turno.estado === "enEspera" ? "secondary" :
                turno.estado === "llamando" ? "info" : "success"
              }`}>
                {turno.estado}
              </span>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

// Componente reutilizable para secciones
const SeccionTurnos = ({ titulo, color, turnos, boton }) => (
  <section className="mb-4">
    <h4 className={`text-${color} mb-2`}>{titulo} ({turnos.length})</h4>
    {turnos.length === 0 ? (
      <p className="text-muted">No hay pacientes en esta etapa.</p>
    ) : (
      turnos.map((turno) => (
        <div key={turno.id} className={`card p-3 mb-2 shadow-sm border-${color}`}>
          <strong>{turno.paciente.nombre}</strong> - {turno.motivo}
          <div className="text-muted">Prioridad: {turno.prioridad}</div>
          {boton(turno)}
        </div>
      ))
    )}
  </section>
);

export default ColaMedico;
