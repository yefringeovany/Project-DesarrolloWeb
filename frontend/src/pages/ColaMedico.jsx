import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Clock, User, CheckCircle, Phone, Stethoscope } from "lucide-react";

const ColaMedico = () => {
  const { usuario, token } = useAuth();
  const [cola, setCola] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Si el usuario no es médico, redirige
  if (usuario?.rol !== "medico") {
    return <Navigate to="/" replace />;
  }

  // ==============================
  // Cargar la cola del médico
  // ==============================
  const obtenerCola = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/turnos/mi-cola", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al obtener la cola");
      const data = await res.json();
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
  }, []);

  // ==============================
  // Llamar siguiente paciente
  // ==============================
  const llamarSiguiente = async (turnoId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/turnos/${turnoId}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nuevoEstado: "llamando",
          observaciones: "Paciente, por favor pase a la clínica",
        }),
      });

      if (!res.ok) throw new Error("Error al cambiar estado a 'llamando'");
      await obtenerCola();
    } catch (err) {
      console.error("Error al llamar paciente:", err);
      setError("No se pudo llamar al paciente.");
    }
  };

  // ==============================
  // Iniciar atención
  // ==============================
  const iniciarAtencion = async (turnoId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/turnos/${turnoId}/iniciar-atencion`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          observaciones: "Iniciando consulta",
        }),
      });

      if (!res.ok) throw new Error("Error al iniciar atención");
      await obtenerCola();
    } catch (err) {
      console.error("Error al iniciar atención:", err);
      setError("No se pudo iniciar la atención del paciente.");
    }
  };

  // ==============================
  // Finalizar atención
  // ==============================
  const finalizarAtencion = async (turnoId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/turnos/${turnoId}/finalizar-atencion`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          observaciones: "Consulta finalizada",
        }),
      });

      if (!res.ok) throw new Error("Error al finalizar atención");
      await obtenerCola();
    } catch (err) {
      console.error("Error al finalizar atención:", err);
      setError("No se pudo finalizar la atención.");
    }
  };

  if (loading) return <div className="text-center mt-5">Cargando turnos...</div>;
  if (error) return <div className="alert alert-danger text-center mt-3">{error}</div>;

  const enEspera = cola?.turnos?.enEspera || [];
  const llamando = cola?.turnos?.llamando || [];
  const atendiendo = cola?.turnos?.atendiendo || [];

  return (
    <div className="container mt-4">
      <h2 className="text-primary mb-3 text-center">
        <Stethoscope className="inline-block mr-2" />
        Cola de Turnos - {usuario.nombre}
      </h2>

      {/* ---------------- EN ESPERA ---------------- */}
      <section className="mb-4">
        <h4 className="text-secondary mb-2">
          <Clock className="inline-block mr-2" /> En Espera ({enEspera.length})
        </h4>
        {enEspera.length === 0 ? (
          <p>No hay pacientes en espera.</p>
        ) : (
          enEspera.map((turno) => (
            <div key={turno.id} className="card p-3 mb-2 shadow-sm">
              <strong>{turno.paciente.nombre}</strong> - {turno.motivo}
              <div className="text-muted">Prioridad: {turno.prioridad}</div>
              <button
                onClick={() => llamarSiguiente(turno.id)}
                className="btn btn-sm btn-warning mt-2"
              >
                <Phone className="inline-block mr-1" /> Llamar
              </button>
            </div>
          ))
        )}
      </section>

      {/* ---------------- LLAMANDO ---------------- */}
      <section className="mb-4">
        <h4 className="text-info mb-2">
          <User className="inline-block mr-2" /> Llamando ({llamando.length})
        </h4>
        {llamando.length === 0 ? (
          <p>No hay pacientes llamando.</p>
        ) : (
          llamando.map((turno) => (
            <div key={turno.id} className="card p-3 mb-2 shadow-sm border-info">
              <strong>{turno.paciente.nombre}</strong> - {turno.motivo}
              <button
                onClick={() => iniciarAtencion(turno.id)}
                className="btn btn-sm btn-success mt-2"
              >
                <Stethoscope className="inline-block mr-1" /> Iniciar Atención
              </button>
            </div>
          ))
        )}
      </section>

      {/* ---------------- ATENDIENDO ---------------- */}
      <section>
        <h4 className="text-success mb-2">
          <CheckCircle className="inline-block mr-2" /> Atendiendo ({atendiendo.length})
        </h4>
        {atendiendo.length === 0 ? (
          <p>No hay pacientes en atención.</p>
        ) : (
          atendiendo.map((turno) => (
            <div key={turno.id} className="card p-3 mb-2 shadow-sm border-success">
              <strong>{turno.paciente.nombre}</strong> - {turno.motivo}
              <button
                onClick={() => finalizarAtencion(turno.id)}
                className="btn btn-sm btn-danger mt-2"
              >
                Finalizar Atención
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default ColaMedico;
