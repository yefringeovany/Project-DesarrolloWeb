import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Clock,
  User,
  CheckCircle,
  Phone,
  Stethoscope,
  Archive,
  ArrowLeft,
} from "lucide-react";
import "../styles/ColaMedico.css";

const ColaMedico = () => {
  const { usuario, token } = useAuth();
  const navigate = useNavigate();
  const [cola, setCola] = useState({ turnos: { enEspera: [], llamando: [], atendiendo: [] } });
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  if (usuario?.rol !== "medico") return <Navigate to="/" replace />;

  const obtenerCola = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/turnos/mi-cola`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al obtener la cola");
      const data = await res.json();

      const pacientesClinica = [
        ...data.turnos.enEspera,
        ...data.turnos.llamando,
        ...data.turnos.atendiendo,
      ].filter((t) => t.paciente.clinicaId === usuario.clinicaAsignadaId);

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
    const interval = setInterval(obtenerCola, 15000);
    return () => clearInterval(interval);
  }, []);

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
    actualizarTurno(`${import.meta.env.VITE_API_URL}/api/turnos/${id}/estado`, {
      nuevoEstado: "llamando",
      observaciones: "Paciente, por favor pase a la clínica",
    });

  const iniciarAtencion = (id) =>
    actualizarTurno(`${import.meta.env.VITE_API_URL}/api/turnos/${id}/iniciar-atencion`, {
      observaciones: "Iniciando consulta",
    });

  const finalizarAtencion = (id) =>
    actualizarTurno(`${import.meta.env.VITE_API_URL}/api/turnos/${id}/finalizar-atencion`, {
      observaciones: "Consulta finalizada",
    });

  const { enEspera, llamando, atendiendo } = cola.turnos;

  if (loading)
    return <div className="no-access-container">Cargando turnos...</div>;
  if (error)
    return <div className="alert error text-center mt-3">{error}</div>;

  return (
    <div className="cola-medico-page">
      <div className="header-top">
        <button className="btn-back" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="me-2" size={18} />
          Regresar al Dashboard
        </button>
      </div>

      <div className="cola-medico-header">
        <h2 className="titulo">
          <Stethoscope className="me-2" /> Cola de Turnos
        </h2>
        <p className="subtitulo">Dr. {usuario?.nombre}</p>
      </div>

      {/* En espera */}
      <div className="glass-card">
        <SeccionTurnos
          titulo="En Espera"
          color="gray"
          turnos={enEspera}
          boton={(turno) => (
            <button
              onClick={() => llamarSiguiente(turno.id)}
              className="btn-modern btn-yellow mt-2"
            >
              <Phone className="me-1" /> Llamar
            </button>
          )}
        />
      </div>

      {/* Llamando */}
      <div className="glass-card">
        <SeccionTurnos
          titulo="Llamando"
          color="blue"
          turnos={llamando}
          boton={(turno) => (
            <button
              onClick={() => iniciarAtencion(turno.id)}
              className="btn-modern btn-green mt-2"
            >
              <Stethoscope className="me-1" /> Iniciar Atención
            </button>
          )}
        />
      </div>

      {/* Atendiendo */}
      <div className="glass-card">
        <SeccionTurnos
          titulo="Atendiendo"
          color="green"
          turnos={atendiendo}
          boton={(turno) => (
            <button
              onClick={() => finalizarAtencion(turno.id)}
              className="btn-modern btn-red mt-2"
            >
              <CheckCircle className="me-1" /> Finalizar Atención
            </button>
          )}
        />
      </div>

      {/* Historial */}
      <div className="glass-card mt-4">
        <h4 className="mb-3">
          <Archive className="me-2" /> Historial de Pacientes
        </h4>
        {historial.length === 0 ? (
          <p className="text-light">No hay historial aún.</p>
        ) : (
          historial.map((turno) => (
            <div key={turno.id} className="historial-item">
              <User className="me-2" /> <strong>{turno.paciente.nombre}</strong> —{" "}
              <span className="estado">{turno.estado}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const SeccionTurnos = ({ titulo, color, turnos, boton }) => (
  <section className="seccion-turnos">
    <h4 className="seccion-titulo">{titulo} ({turnos.length})</h4>
    {turnos.length === 0 ? (
      <p className="text-light">No hay pacientes en esta etapa.</p>
    ) : (
      turnos.map((turno) => (
        <div key={turno.id} className="turno-card">
          <strong>{turno.paciente.nombre}</strong> - {turno.motivo}
          <div className="text-light">Prioridad: {turno.prioridad}</div>
          {boton(turno)}
        </div>
      ))
    )}
  </section>
);

export default ColaMedico;
