import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Activity, Clock, MapPin, AlertTriangle, AlertOctagon } from "lucide-react";
import "../styles/PantallaPublica.css"; // 👈 Importar los estilos

/**
 * Componente de pantalla pública para mostrar turnos en tiempo real
 * Con animaciones de entrada/salida y gestión de cola
 */
const PantallaPublica = () => {
  const [turnosActivos, setTurnosActivos] = useState([]); // Llamando/Atendiendo
  const [turnosEnCola, setTurnosEnCola] = useState([]); // En espera
  const [ultimoLlamado, setUltimoLlamado] = useState(null);
  const [turnosSaliendo, setTurnosSaliendo] = useState(new Set());
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const MAX_TURNOS_ACTIVOS = 6; // Máximo de turnos activos a mostrar
  const MAX_TURNOS_COLA = 10; // Máximo de turnos en cola

  // ========================================
  // 🕐 ACTUALIZAR HORA
  // ========================================
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ========================================
  // 🔌 CONFIGURAR WEBSOCKET
  // ========================================
  useEffect(() => {
    const socketOptions = {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    };

    const newSocket = io('http://localhost:5000', socketOptions);

    newSocket.on('connect', () => {
      console.log('✅ Socket conectado');
      setIsConnected(true);
      newSocket.emit('join:pantalla');
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket desconectado');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // ========================================
  // 📡 ESCUCHAR EVENTOS DE SOCKET
  // ========================================
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Turno nuevo
    socket.on('turno:nuevo', (turno) => {
      console.log('🆕 Nuevo turno:', turno);
      
      if (turno.estado === 'espera') {
        setTurnosEnCola((prev) => {
          const existe = prev.find(t => t.id === turno.id);
          if (existe) return prev;
          return [...prev, turno].slice(0, MAX_TURNOS_COLA);
        });
      } else if (['llamando', 'atendiendo'].includes(turno.estado)) {
        setTurnosActivos((prev) => {
          const existe = prev.find(t => t.id === turno.id);
          if (existe) return prev;
          return [turno, ...prev].slice(0, MAX_TURNOS_ACTIVOS);
        });
      }
    });

    // Turno actualizado
    socket.on('turno:actualizado', (turno) => {
      console.log('♻️ Turno actualizado:', turno);
      
      if (['llamando', 'atendiendo'].includes(turno.estado)) {
        setTurnosEnCola((prev) => prev.filter((t) => t.id !== turno.id));
        
        setTurnosActivos((prev) => {
          const index = prev.findIndex((t) => t.id === turno.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = turno;
            return updated;
          } else {
            return [turno, ...prev].slice(0, MAX_TURNOS_ACTIVOS);
          }
        });
      } 
      else if (['finalizado', 'ausente', 'cancelado'].includes(turno.estado)) {
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
      }
      else if (turno.estado === 'espera') {
        setTurnosActivos((prev) => prev.filter((t) => t.id !== turno.id));
        
        setTurnosEnCola((prev) => {
          const existe = prev.find((t) => t.id === turno.id);
          if (existe) return prev;
          return [...prev, turno].slice(0, MAX_TURNOS_COLA);
        });
      }
    });

    // Turno cambio de estado
    socket.on('turno:cambioEstado', (data) => {
      console.log('🔄 Cambio de estado:', data);
      
      if (['llamando', 'atendiendo'].includes(data.estadoNuevo)) {
        setTurnosEnCola((prev) => prev.filter((t) => t.id !== data.id));
        
        setTurnosActivos((prev) => {
          const index = prev.findIndex((t) => t.id === data.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = data;
            return updated;
          } else {
            return [data, ...prev].slice(0, MAX_TURNOS_ACTIVOS);
          }
        });
      } else if (['finalizado', 'ausente', 'cancelado'].includes(data.estadoNuevo)) {
        setTurnosSaliendo((prev) => new Set([...prev, data.id]));
        
        setTimeout(() => {
          setTurnosActivos((prev) => prev.filter((t) => t.id !== data.id));
          setTurnosEnCola((prev) => prev.filter((t) => t.id !== data.id));
          setTurnosSaliendo((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.id);
            return newSet;
          });
        }, 600);
      } else if (data.estadoNuevo === 'espera') {
        setTurnosActivos((prev) => prev.filter((t) => t.id !== data.id));
        
        setTurnosEnCola((prev) => {
          const existe = prev.find((t) => t.id === data.id);
          if (existe) return prev;
          return [...prev, data].slice(0, MAX_TURNOS_COLA);
        });
      }
    });

    // Turno llamando - Destacado especial
    socket.on('turno:llamando', (data) => {
      console.log('📢 Turno llamando:', data);
      setUltimoLlamado(data.turno);
      reproducirSonido();
      setTimeout(() => setUltimoLlamado(null), 8000);
    });

    return () => {
      socket.off('turno:nuevo');
      socket.off('turno:actualizado');
      socket.off('turno:cambioEstado');
      socket.off('turno:llamando');
    };
  }, [socket, isConnected]);

  // ========================================
  // 🌐 CARGAR DATOS INICIALES
  // ========================================
  useEffect(() => {
    cargarTurnos();
    
    const interval = setInterval(cargarTurnos, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarTurnos = async () => {
    try {
      const resActivos = await fetch("http://localhost:5000/api/turnos/pantalla");
      const dataActivos = await resActivos.json();
      setTurnosActivos(dataActivos.turnos || []);
    } catch (err) {
      console.error("Error al cargar turnos:", err);
    }
  };

  const reproducirSonido = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('No se pudo reproducir sonido'));
    } catch (e) {
      console.log('Error reproduciendo sonido');
    }
  };

  // ========================================
  // 🎨 COMPONENTES DE TURNO
  // ========================================
  const TurnoCard = ({ turno, tipo = 'activo' }) => {
    const estaSaliendo = turnosSaliendo.has(turno.id);
    
    const cardClass = tipo === 'activo'
      ? turno.estado === "llamando"
        ? "turno-card llamando"
        : "turno-card atendiendo"
      : "turno-card cola";

    return (
      <div 
        className={`${cardClass} ${estaSaliendo ? 'saliendo' : ''}`}
        key={turno.id}
      >
        <div className="turno-numero">
          {turno.numeroTurno}
        </div>
        
        <div className="turno-estado">
          {turno.estado === "llamando" && (
            <span className="badge-llamando">📢 LLAMANDO</span>
          )}
          {turno.estado === "atendiendo" && (
            <span className="badge-atendiendo">⚕️ ATENDIENDO</span>
          )}
          {turno.estado === "espera" && tipo === 'cola' && (
            <span className="badge-espera">⏳ EN ESPERA</span>
          )}
        </div>

        <div className="turno-paciente">
          {turno.paciente?.nombre}
        </div>

        <div className="turno-clinica">
          <MapPin size={20} />
          {turno.clinica?.nombre_clinica}
        </div>

        {turno.prioridad === "emergencia" && (
          <div className="turno-prioridad emergencia">
            <AlertOctagon size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
            EMERGENCIA
          </div>
        )}
        {turno.prioridad === "urgente" && (
          <div className="turno-prioridad urgente">
            <AlertTriangle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
            URGENTE
          </div>
        )}
      </div>
    );
  };

  // ========================================
  // 🎯 RENDER
  // ========================================
  return (
    <div className="pantalla-publica">
      {/* Header */}
      <div className="pantalla-header">
        <div className="pantalla-header-content">
          <div className="pantalla-logo">
            <Activity size={30} className="text-primary" />
          </div>
          <h1>SISTEMA DE TURNOS MÉDICOS</h1>
        </div>
        <span className={`status-badge ${isConnected ? 'status-conectado' : 'status-desconectado'}`}>
          ● {isConnected ? 'En tiempo real' : 'Desconectado'}
        </span>
      </div>

      {/* Banner de Último Llamado */}
      {ultimoLlamado && (
        <div className="ultimo-llamado">
          <div className="ultimo-llamado-content">
            <div className="ultimo-llamado-label">
              🔔 ATENCIÓN
            </div>
            <div className="ultimo-llamado-numero">
              TURNO {ultimoLlamado.numeroTurno}
            </div>
            <div className="ultimo-llamado-paciente">
              {ultimoLlamado.paciente?.nombre}
            </div>
            <div className="ultimo-llamado-clinica">
              📍 {ultimoLlamado.clinica?.nombre_clinica}
            </div>
          </div>
        </div>
      )}

      {/* Contenedor Principal */}
      <div className="pantalla-contenedor">
        {/* Turnos Activos (Llamando/Atendiendo) */}
        <div className="pantalla-seccion">
          <div className="seccion-titulo">
            <Clock size={28} />
            TURNOS ACTIVOS
          </div>
          {turnosActivos.length === 0 ? (
            <div className="mensaje-vacio">
              No hay turnos activos en este momento
            </div>
          ) : (
            <div className="turnos-grid">
              {turnosActivos.map((turno) => (
                <TurnoCard key={turno.id} turno={turno} tipo="activo" />
              ))}
            </div>
          )}
        </div>

        {/* Cola de Turnos en Espera */}
        {turnosEnCola.length > 0 && (
          <div className="pantalla-seccion">
            <div className="seccion-titulo">
              <Clock size={28} />
              PRÓXIMOS TURNOS EN COLA
            </div>
            <div className="turnos-grid">
              {turnosEnCola.map((turno) => (
                <TurnoCard key={turno.id} turno={turno} tipo="cola" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer con Hora */}
      <div className="pantalla-footer">
        {currentTime.toLocaleString('es-GT', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}
      </div>
    </div>
  );
};

export default PantallaPublica;