import { useEffect, useState } from "react";
import { io } from "socket.io-client";

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

  const MAX_TURNOS_ACTIVOS = 6; // Máximo de turnos activos a mostrar
  const MAX_TURNOS_COLA = 10; // Máximo de turnos en cola

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
          // Verificar si ya existe para evitar duplicados
          const existe = prev.find(t => t.id === turno.id);
          if (existe) return prev;
          return [...prev, turno].slice(0, MAX_TURNOS_COLA);
        });
      } else if (['llamando', 'atendiendo'].includes(turno.estado)) {
        setTurnosActivos((prev) => {
          // Verificar si ya existe para evitar duplicados
          const existe = prev.find(t => t.id === turno.id);
          if (existe) return prev;
          return [turno, ...prev].slice(0, MAX_TURNOS_ACTIVOS);
        });
      }
    });

    // Turno actualizado
    socket.on('turno:actualizado', (turno) => {
      console.log('♻️ Turno actualizado:', turno);
      
      // Si está llamando o atendiendo
      if (['llamando', 'atendiendo'].includes(turno.estado)) {
        // Remover de cola si estaba ahí
        setTurnosEnCola((prev) => prev.filter((t) => t.id !== turno.id));
        
        // Agregar o actualizar en activos (evitando duplicados)
        setTurnosActivos((prev) => {
          const index = prev.findIndex((t) => t.id === turno.id);
          if (index >= 0) {
            // Ya existe, actualizar
            const updated = [...prev];
            updated[index] = turno;
            return updated;
          } else {
            // No existe, agregar
            return [turno, ...prev].slice(0, MAX_TURNOS_ACTIVOS);
          }
        });
      } 
      // Si cambió a finalizado, ausente o cancelado
      else if (['finalizado', 'ausente', 'cancelado'].includes(turno.estado)) {
        // Animación de salida
        setTurnosSaliendo((prev) => new Set([...prev, turno.id]));
        
        setTimeout(() => {
          setTurnosActivos((prev) => prev.filter((t) => t.id !== turno.id));
          setTurnosEnCola((prev) => prev.filter((t) => t.id !== turno.id));
          setTurnosSaliendo((prev) => {
            const newSet = new Set(prev);
            newSet.delete(turno.id);
            return newSet;
          });
        }, 500); // Duración de animación de salida
      }
      // Si cambió a espera
      else if (turno.estado === 'espera') {
        // Remover de activos
        setTurnosActivos((prev) => prev.filter((t) => t.id !== turno.id));
        
        // Agregar a cola si no existe
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
      
      // Aplicar la misma lógica que turno:actualizado
      if (['llamando', 'atendiendo'].includes(data.estadoNuevo)) {
        setTurnosEnCola((prev) => prev.filter((t) => t.id !== data.id));
        
        setTurnosActivos((prev) => {
          const index = prev.findIndex((t) => t.id === data.id);
          if (index >= 0) {
            // Ya existe, actualizar
            const updated = [...prev];
            updated[index] = data;
            return updated;
          } else {
            // No existe, agregar
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
        }, 500);
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
    
    // Actualizar cada 30 segundos como respaldo
    const interval = setInterval(cargarTurnos, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarTurnos = async () => {
    try {
      // Cargar turnos activos (llamando/atendiendo)
      const resActivos = await fetch("http://localhost:5000/api/turnos/pantalla");
      const dataActivos = await resActivos.json();
      setTurnosActivos(dataActivos.turnos || []);

      // Cargar turnos en espera (necesitarías un endpoint adicional o modificar el existente)
      // Por ahora usaremos solo los activos
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
          📍 {turno.clinica?.nombre_clinica}
        </div>

        {turno.prioridad === "emergencia" && (
          <div className="turno-prioridad emergencia">
            🚨 EMERGENCIA
          </div>
        )}
        {turno.prioridad === "urgente" && (
          <div className="turno-prioridad urgente">
            ⚠️ URGENTE
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
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .pantalla-publica {
          min-height: 100vh;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          overflow-x: hidden;
        }

        .header {
          background: rgba(0, 0, 0, 0.3);
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header h1 {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .status-badge {
          display: inline-block;
          padding: 0.5rem 1.5rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .status-conectado {
          background: #10b981;
          animation: pulse 2s infinite;
        }

        .status-desconectado {
          background: #ef4444;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        /* BANNER DE ÚLTIMO LLAMADO */
        .ultimo-llamado {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          padding: 3rem;
          text-align: center;
          animation: slideDown 0.5s ease-out, pulse-bg 1.5s infinite;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
          color: #1f2937;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes pulse-bg {
          0%, 100% { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); }
          50% { background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); }
        }

        .ultimo-llamado-numero {
          font-size: 4rem;
          font-weight: bold;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .ultimo-llamado-paciente {
          font-size: 2.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .ultimo-llamado-clinica {
          font-size: 1.5rem;
        }

        /* CONTENEDOR PRINCIPAL */
        .contenedor {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .seccion {
          margin-bottom: 3rem;
        }

        .seccion-titulo {
          font-size: 1.8rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 3px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* GRID DE TURNOS */
        .turnos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        /* TARJETA DE TURNO */
        .turno-card {
          background: white;
          border-radius: 15px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease-out;
          position: relative;
          overflow: hidden;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .turno-card.saliendo {
          animation: fadeOutDown 0.5s ease-out forwards;
        }

        @keyframes fadeOutDown {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
        }

        .turno-card.llamando {
          border: 4px solid #fbbf24;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          animation: fadeInUp 0.5s ease-out, shake 0.5s ease-out 0.3s;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .turno-card.atendiendo {
          border: 3px solid #3b82f6;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        }

        .turno-card.cola {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          color: #1f2937;
          opacity: 0.9;
        }

        .turno-numero {
          font-size: 2.5rem;
          font-weight: bold;
          color: #1e40af;
          text-align: center;
          margin-bottom: 1rem;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
        }

        .turno-estado {
          text-align: center;
          margin-bottom: 1rem;
        }

        .badge-llamando {
          background: #fbbf24;
          color: #1f2937;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: bold;
          font-size: 0.9rem;
          display: inline-block;
        }

        .badge-atendiendo {
          background: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: bold;
          font-size: 0.9rem;
          display: inline-block;
        }

        .badge-espera {
          background: #6b7280;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.85rem;
          display: inline-block;
        }

        .turno-paciente {
          font-size: 1.3rem;
          font-weight: 600;
          color: #1f2937;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .turno-clinica {
          font-size: 1rem;
          color: #6b7280;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .turno-prioridad {
          text-align: center;
          margin-top: 1rem;
          padding: 0.5rem;
          border-radius: 10px;
          font-weight: bold;
          font-size: 0.9rem;
        }

        .turno-prioridad.emergencia {
          background: #fee2e2;
          color: #dc2626;
        }

        .turno-prioridad.urgente {
          background: #fef3c7;
          color: #d97706;
        }

        .mensaje-vacio {
          text-align: center;
          padding: 3rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.7);
        }

        /* FOOTER */
        .footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.5);
          padding: 1rem;
          text-align: center;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .header h1 {
            font-size: 1.8rem;
          }

          .ultimo-llamado-numero {
            font-size: 3rem;
          }

          .ultimo-llamado-paciente {
            font-size: 1.8rem;
          }

          .turnos-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header */}
      <div className="header">
        <h1>🏥 SISTEMA DE TURNOS</h1>
        <span className={`status-badge ${isConnected ? 'status-conectado' : 'status-desconectado'}`}>
          ● {isConnected ? 'EN TIEMPO REAL' : 'DESCONECTADO'}
        </span>
      </div>

      {/* Banner de Último Llamado */}
      {ultimoLlamado && (
        <div className="ultimo-llamado">
          <div className="ultimo-llamado-numero">
            📢 TURNO {ultimoLlamado.numeroTurno}
          </div>
          <div className="ultimo-llamado-paciente">
            {ultimoLlamado.paciente?.nombre}
          </div>
          <div className="ultimo-llamado-clinica">
            {ultimoLlamado.clinica?.nombre_clinica}
          </div>
        </div>
      )}

      {/* Contenedor Principal */}
      <div className="contenedor">
        {/* Turnos Activos (Llamando/Atendiendo) */}
        <div className="seccion">
          <div className="seccion-titulo">
            🔔 TURNOS ACTIVOS
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
          <div className="seccion">
            <div className="seccion-titulo">
              ⏳ PRÓXIMOS TURNOS EN COLA
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
      <div className="footer">
        {new Date().toLocaleString('es-GT', {
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