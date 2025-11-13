import HistorialTurno from "../models/HistorialTurno.js";

/**
 * 📋 Obtener todos los registros del historial de turnos
 * 🔐 Solo lectura (GET)
 */
export const obtenerHistorialTurnos = async (req, res) => {
  try {
    const historial = await HistorialTurno.findAll({
      order: [["timestamp", "DESC"]],
    });

    if (!historial || historial.length === 0) {
      return res.status(200).json({
        mensaje: "No hay registros en el historial todavía.",
        historial: [],
      });
    }

    res.status(200).json({
      mensaje: "✅ Historial de turnos obtenido correctamente",
      total: historial.length,
      historial,
    });
  } catch (error) {
    console.error("❌ Error al obtener historial de turnos:", error);
    res.status(500).json({
      mensaje: "Error al obtener el historial de turnos",
      detalle: error.message || "Error desconocido. Ver consola del servidor para más detalles.",
    });
  }
};
