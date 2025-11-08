import { useEffect, useState } from "react";
import useSocket from "../hooks/useSocket";

/**
 * Componente de pantalla pública para mostrar turnos en tiempo real
 * No requiere autenticación
 */
const PantallaPublica = () => {
  const [turnosActivos, setTurnosActivos] = useState([]);
  const [ultimoLlamado, setUltimoLlamado] = useState(null);

  // Conectar sin autenticación
  const { socket, isConnected } = useSocket('http://localhost:5000', false);

  // ========================================
  // 📡 CONFIGURAR WEBSOCKET
  // ========================================
  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log('🔔 Pantalla pública conectada');

    // Unirse a sala pública
    socket.emit('join:pantalla');

    socket.on('joined:pantalla', (data) => {
      console.log('✅ Unido a pantalla pública:', data);
    });

    // Escuchar turnos nuevos
    socket.on('turno:nuevo', (turno) => {
      console.log('🆕 Nuevo turno en pantalla:', turno);
      cargarTurnosActivos();
    });

    // Escuchar actualizaciones
    socket.on('turno:actualizado', (turno) => {
      console.log('♻️ Turno actualizado:', turno);
      
      setTurnosActivos((prev) => {
        // Si es llamando o atendiendo, actualizar o agregar
        if (['llamando', 'atendiendo'].includes(turno.estado)) {
          const index = prev.findIndex((t) => t.id === turno.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = turno;
            return updated;
          } else {
            return [turno, ...prev].slice(0, 10);
          }
        } else {
          // Si cambió a otro estado, remover
          return prev.filter((t) => t.id !== turno.id);
        }
      });

      // Si está siendo llamado, mostrarlo destacado
      if (turno.estado === 'llamando') {
        setUltimoLlamado(turno);
        setTimeout(() => setUltimoLlamado(null), 10000); // 10 segundos
      }
    });

    // Escuchar cuando se llama un turno
    socket.on('turno:llamando', (data) => {
      console.log('📢 Turno llamando:', data);
      setUltimoLlamado(data.turno);
      
      // Reproducir sonido de notificación (opcional)
      reproducirSonido();
      
      setTimeout(() => setUltimoLlamado(null), 10000);
    });

    return () => {
      socket.off('turno:nuevo');
      socket.off('turno:actualizado');
      socket.off('turno:llamando');
      socket.off('joined:pantalla');
    };
  }, [socket, isConnected]);

  // ========================================
  // 🌐 CARGAR DATOS INICIALES
  // ========================================
  useEffect(() => {
    cargarTurnosActivos();
    
    // Actualizar cada 30 segundos como respaldo
    const interval = setInterval(cargarTurnosActivos, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarTurnosActivos = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/turnos/pantalla");
      const data = await res.json();
      setTurnosActivos(data.turnos || []);
    } catch (err) {
      console.error("Error al cargar turnos:", err);
    }
  };

  const reproducirSonido = () => {
    // Opcional: agregar un archivo de audio
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('No se pudo reproducir sonido'));
    } catch (e) {
      console.log('Error reproduciendo sonido');
    }
  };

  // ========================================
  // 🎨 RENDER
  // ========================================
  return (
    <div className="min-vh-100 bg-dark text-white">
      {/* Header */}
      <div className="bg-primary p-4 text-center">
        <h1 className="display-4 fw-bold mb-0">
          🏥 SISTEMA DE TURNOS
        </h1>
        <p className="mb-0">
          {isConnected ? (
            <span className="badge bg-success">● EN TIEMPO REAL</span>
          ) : (
            <span className="badge bg-danger">● DESCONECTADO</span>
          )}
        </p>
      </div>

      {/* Último Llamado - Destacado */}
      {ultimoLlamado && (
        <div className="bg-warning text-dark p-5 text-center animate__animated animate__pulse animate__infinite">
          <h2 className="display-3 fw-bold mb-3">
            📢 TURNO {ultimoLlamado.numeroTurno}
          </h2>
          <h3 className="display-5">
            {ultimoLlamado.paciente?.nombre}
          </h3>
          <p className="fs-4 mb-0">
            {ultimoLlamado.clinica?.nombre_clinica}
          </p>
        </div>
      )}

      {/* Lista de Turnos Activos */}
      <div className="container-fluid p-4">
        <div className="row g-3">
          {turnosActivos.length === 0 ? (
            <div className="col-12 text-center py-5">
              <h3 className="text-muted">No hay turnos en proceso</h3>
            </div>
          ) : (
            turnosActivos.map((turno) => (
              <div key={turno.id} className="col-lg-4 col-md-6">
                <div
                  className={`card h-100 ${
                    turno.estado === "llamando"
                      ? "border-warning border-3 bg-warning bg-opacity-10"
                      : "bg-dark text-white"
                  }`}
                  style={{
                    transition: "all 0.3s ease",
                  }}
                >
                  <div className="card-body text-center p-4">
                    {/* Número de Turno */}
                    <h2 className="display-4 fw-bold text-primary mb-3">
                      {turno.numeroTurno}
                    </h2>

                    {/* Estado */}
                    <div className="mb-3">
                      {turno.estado === "llamando" && (
                        <span className="badge bg-warning text-dark fs-5 px-4 py-2">
                          📢 LLAMANDO
                        </span>
                      )}
                      {turno.estado === "atendiendo" && (
                        <span className="badge bg-info text-dark fs-5 px-4 py-2">
                          ⚕️ ATENDIENDO
                        </span>
                      )}
                    </div>

                    {/* Paciente */}
                    <h4 className="mb-2">{turno.paciente?.nombre}</h4>

                    {/* Clínica */}
                    <p className="text-muted mb-0">
                      📍 {turno.clinica?.nombre_clinica}
                    </p>

                    {/* Prioridad */}
                    {turno.prioridad === "emergencia" && (
                      <div className="mt-3">
                        <span className="badge bg-danger fs-6">
                          🚨 EMERGENCIA
                        </span>
                      </div>
                    )}
                    {turno.prioridad === "urgente" && (
                      <div className="mt-3">
                        <span className="badge bg-warning text-dark fs-6">
                          ⚠️ URGENTE
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer con Hora */}
      <div className="fixed-bottom bg-dark bg-opacity-75 text-center py-2">
        <small className="text-muted">
          {new Date().toLocaleString('es-GT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </small>
      </div>
    </div>
  );
};

export default PantallaPublica;