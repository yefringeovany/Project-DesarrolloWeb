import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/HistorialTurnos.css";

const HistorialTurnos = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/historial-turnos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error al obtener historial");
      setHistorial(data.historial || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="historial-modern-container">
      <header className="historial-header">
        <h1 className="historial-modern-title">
          <FileText size={28} className="me-2" />
          Historial de Turnos
        </h1>
        <button className="btn-back" onClick={() => navigate("/dashboard")}>
          ← Regresar al Dashboard
        </button>
      </header>

      {loading && <p className="loading-text">Cargando historial...</p>}
      {error && <div className="alert error">{error}</div>}
      {!loading && historial.length === 0 && (
        <p className="empty-text">No hay registros en el historial todavía.</p>
      )}

      {!loading && historial.length > 0 && (
        <div className="glass-card tabla-card">
          <table className="historial-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Turno</th>
                <th>Estado Nuevo</th>
                <th>Comentario</th>
                <th>Usuario</th>
                <th>Fecha / Hora</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.turnoId}</td>
                  <td>
                    <span
                      className={`estado-badge ${
                        item.estadoNuevo === "finalizado"
                          ? "estado-finalizado"
                          : item.estadoNuevo === "cancelado"
                          ? "estado-cancelado"
                          : "estado-en-espera"
                      }`}
                    >
                      {item.estadoNuevo}
                    </span>
                  </td>
                  <td>{item.comentario || "—"}</td>
                  <td>{item.usuario?.nombre || "Sistema"}</td>
                  <td>
                    <Clock size={14} className="me-1 text-muted" />
                    {new Date(item.createdAt).toLocaleString("es-GT")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistorialTurnos;
