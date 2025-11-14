import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Activity, Clock, MapPin, AlertTriangle, AlertOctagon } from "lucide-react";
import "../styles/PantallaPublica.css";
import axios from "axios";

const PantallaPublica = () => {
  const [turnosActivos, setTurnosActivos] = useState([]);
  const [turnosEnCola, setTurnosEnCola] = useState([]);
  const [ultimoLlamado, setUltimoLlamado] = useState(null);
  const [turnosSaliendo, setTurnosSaliendo] = useState(new Set());
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const MAX_TURNOS_ACTIVOS = 6;
  const MAX_TURNOS_COLA = 10;

  // Actualizar hora
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Configurar WebSocket
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL, { transports: ["websocket", "polling"] });
    newSocket.on("connect", () => {
      console.log("✅ Socket conectado");
      setIsConnected(true);
      newSocket.emit("join:pantalla");
    });
    newSocket.on("disconnect", () => {
      console.log("🔌 Socket desconectado");
      setIsConnected(false);
    });
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  // Escuchar eventos de Socket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const actualizarTurnos = (turno) => {
      if (["llamando", "atendiendo"].includes(turno.estado)) {
        setTurnosEnCola((prev) => prev.filter((t) => t.id !== turno.id));
        setTurnosActivos((prev) => {
          const index = prev.findIndex((t) => t.id === turno.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = turno;
            return updated;
          }
          return [turno, ...prev].slice(0, MAX_TURNOS_ACTIVOS);
        });
      } else if (["finalizado", "ausente", "cancelado"].includes(turno.estado)) {
        setTurnosSaliendo((prev) => new Set([...prev, turno.id]));
        setTimeout(() => {
          setTurnosActivos((prev) => prev.filter((t) => t.id !== turno.id));
          setTurnosEnCola((prev) => prev.filter((t) => t.id !== turno.id));
          setTurnosSaliendo((prev) => {
            const newSet = new Set(prev);
            newSet.delete(turno.id);
            return newSet;
          });
        }, 600);
      } else if (turno.estado === "espera") {
        setTurnosActivos((prev) => prev.filter((t) => t.id !== turno.id));
        setTurnosEnCola((prev) => {
          const existe = prev.find((t) => t.id === turno.id);
          if (existe) return prev;
          return [...prev, turno].slice(0, MAX_TURNOS_COLA);
        });
      }
    };

    socket.on("turno:nuevo", actualizarTurnos);
    socket.on("turno:actualizado", actualizarTurnos);
    socket.on("turno:cambioEstado", actualizarTurnos);

    // Turno llamando → TTS backend
    socket.on("turno:llamando", (data) => {
      console.log("📢 Turno llamando:", data);
      setUltimoLlamado(data.turno);
      reproducirVozTTSBackend(data.turno.numeroTurno, data.turno.clinica?.nombre_clinica);
      setTimeout(() => setUltimoLlamado(null), 8000);
    });

    return () => {
      socket.off("turno:nuevo", actualizarTurnos);
      socket.off("turno:actualizado", actualizarTurnos);
      socket.off("turno:cambioEstado", actualizarTurnos);
      socket.off("turno:llamando");
    };
  }, [socket, isConnected]);

  // Cargar turnos iniciales
  useEffect(() => {
    cargarTurnos();
    const interval = setInterval(cargarTurnos, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarTurnos = async () => {
    try {
      const resActivos = await fetch(`${import.meta.env.VITE_API_URL}/api/turnos/pantalla`);
      const dataActivos = await resActivos.json();
      setTurnosActivos(dataActivos.turnos || []);
    } catch (err) {
      console.error("Error al cargar turnos:", err);
    }
  };

  // Función reproducir voz via backend TTS
  const reproducirVozTTSBackend = async (numeroTurno, nombreClinica) => {
  try {
    const texto = `Turno número ${numeroTurno}, favor de pasar a la clínica ${nombreClinica || ""}`;
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/tts`, { text: texto },
      { responseType: "arraybuffer" }
    );
    const audioBlob = new Blob([res.data], { type: "audio/mpeg" });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (err) {
    console.error("Error generando TTS backend:", err);
  }
};

  // Componente TurnoCard
  const TurnoCard = ({ turno, tipo = "activo" }) => {
    const estaSaliendo = turnosSaliendo.has(turno.id);
    const cardClass =
      tipo === "activo"
        ? turno.estado === "llamando"
          ? "turno-card llamando"
          : "turno-card atendiendo"
        : "turno-card cola";

    return (
      <div className={`${cardClass} ${estaSaliendo ? "saliendo" : ""}`} key={turno.id}>
        <div className="turno-numero">{turno.numeroTurno}</div>

        <div className="turno-estado">
          {turno.estado === "llamando" && <span className="badge-llamando">📢 LLAMANDO</span>}
          {turno.estado === "atendiendo" && <span className="badge-atendiendo">⚕️ ATENDIENDO</span>}
          {turno.estado === "espera" && tipo === "cola" && <span className="badge-espera">⏳ EN ESPERA</span>}
        </div>

        <div className="turno-paciente">{turno.paciente?.nombre}</div>
        <div className="turno-clinica">
          <MapPin size={20} /> {turno.clinica?.nombre_clinica}
        </div>

        {turno.prioridad === "emergencia" && (
          <div className="turno-prioridad emergencia">
            <AlertOctagon size={18} /> EMERGENCIA
          </div>
        )}
        {turno.prioridad === "urgente" && (
          <div className="turno-prioridad urgente">
            <AlertTriangle size={18} /> URGENTE
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pantalla-publica">
      <div className="pantalla-header">
        <div className="pantalla-header-content">
          <div className="pantalla-logo">
            <Activity size={30} />
          </div>
          <h1>SISTEMA DE TURNOS MÉDICOS</h1>
        </div>
        <span className={`status-badge ${isConnected ? "status-conectado" : "status-desconectado"}`}>
          ● {isConnected ? "En tiempo real" : "Desconectado"}
        </span>
      </div>

      {ultimoLlamado && (
        <div className="ultimo-llamado">
          <div className="ultimo-llamado-content">
            <div className="ultimo-llamado-label">🔔 ATENCIÓN</div>
            <div className="ultimo-llamado-numero">TURNO {ultimoLlamado.numeroTurno}</div>
            <div className="ultimo-llamado-paciente">{ultimoLlamado.paciente?.nombre}</div>
            <div className="ultimo-llamado-clinica">📍 {ultimoLlamado.clinica?.nombre_clinica}</div>
          </div>
        </div>
      )}

      <div className="pantalla-contenedor">
        <div className="pantalla-seccion">
          <div className="seccion-titulo">
            <Clock size={28} /> TURNOS ACTIVOS
          </div>
          {turnosActivos.length === 0 ? (
            <div className="mensaje-vacio">No hay turnos activos en este momento</div>
          ) : (
            <div className="turnos-grid">{turnosActivos.map((t) => <TurnoCard key={t.id} turno={t} tipo="activo" />)}</div>
          )}
        </div>

        {turnosEnCola.length > 0 && (
          <div className="pantalla-seccion">
            <div className="seccion-titulo">
              <Clock size={28} /> PRÓXIMOS TURNOS EN COLA
            </div>
            <div className="turnos-grid">{turnosEnCola.map((t) => <TurnoCard key={t.id} turno={t} tipo="cola" />)}</div>
          </div>
        )}
      </div>

      <div className="pantalla-footer">
        {currentTime.toLocaleString("es-GT", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })}
      </div>
    </div>
  );
};

export default PantallaPublica;
