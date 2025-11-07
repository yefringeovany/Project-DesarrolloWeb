import Clinica from "../models/Clinica.js";
import Turno from "../models/Turno.js";
import { Op } from "sequelize";

// ==========================
// Crear nueva clínica
// ==========================
export const crearClinica = async (req, res) => {
  try {
    const { nombre_clinica, direccion, telefono } = req.body;

    // Validar que el usuario sea admin
    if (req.usuario.Rol.nombre_rol !== 'admin') {
      return res.status(403).json({ 
        mensaje: "Solo administradores pueden crear clínicas." 
      });
    }

    if (!nombre_clinica || !direccion) {
      return res.status(400).json({ 
        mensaje: "Nombre y dirección son obligatorios." 
      });
    }

    const nuevaClinica = await Clinica.create({
      nombre_clinica,
      direccion,
      telefono
    });

    res.status(201).json({
      mensaje: "Clínica creada exitosamente.",
      clinica: nuevaClinica
    });
  } catch (error) {
    console.error("Error al crear clínica:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Listar todas las clínicas
// ==========================
export const listarClinicas = async (req, res) => {
  try {
    const clinicas = await Clinica.findAll({
      order: [['nombre_clinica', 'ASC']]
    });

    res.json({ clinicas });
  } catch (error) {
    console.error("Error al listar clínicas:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Obtener clínica por ID con estadísticas
// ==========================
export const obtenerClinica = async (req, res) => {
  try {
    const { id } = req.params;
    const hoy = new Date().toISOString().split('T')[0];

    const clinica = await Clinica.findByPk(id);
    if (!clinica) {
      return res.status(404).json({ mensaje: "Clínica no encontrada." });
    }

    // Obtener turnos del día
    const turnosHoy = await Turno.count({
      where: {
        clinicaId: id,
        fecha: hoy
      }
    });

    const turnosEnEspera = await Turno.count({
      where: {
        clinicaId: id,
        fecha: hoy,
        estado: 'espera'
      }
    });

    res.json({ 
      clinica,
      estadisticasHoy: {
        totalTurnos: turnosHoy,
        enEspera: turnosEnEspera
      }
    });
  } catch (error) {
    console.error("Error al obtener clínica:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Actualizar clínica
// ==========================
export const actualizarClinica = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_clinica, direccion, telefono } = req.body;

    if (req.usuario.Rol.nombre_rol !== 'admin') {
      return res.status(403).json({ 
        mensaje: "Solo administradores pueden actualizar clínicas." 
      });
    }

    const clinica = await Clinica.findByPk(id);
    if (!clinica) {
      return res.status(404).json({ mensaje: "Clínica no encontrada." });
    }

    await clinica.update({
      nombre_clinica: nombre_clinica || clinica.nombre_clinica,
      direccion: direccion || clinica.direccion,
      telefono: telefono !== undefined ? telefono : clinica.telefono
    });

    res.json({
      mensaje: "Clínica actualizada exitosamente.",
      clinica
    });
  } catch (error) {
    console.error("Error al actualizar clínica:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Eliminar clínica
// ==========================
export const eliminarClinica = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.usuario.Rol.nombre_rol !== 'admin') {
      return res.status(403).json({ 
        mensaje: "Solo administradores pueden eliminar clínicas." 
      });
    }

    const clinica = await Clinica.findByPk(id);
    if (!clinica) {
      return res.status(404).json({ mensaje: "Clínica no encontrada." });
    }

    // Verificar si tiene turnos activos
    const turnosActivos = await Turno.count({
      where: {
        clinicaId: id,
        estado: {
          [Op.in]: ['espera', 'llamando', 'atendiendo']
        }
      }
    });

    if (turnosActivos > 0) {
      return res.status(400).json({ 
        mensaje: "No se puede eliminar la clínica porque tiene turnos activos." 
      });
    }

    await clinica.destroy();

    res.json({ mensaje: "Clínica eliminada exitosamente." });
  } catch (error) {
    console.error("Error al eliminar clínica:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};