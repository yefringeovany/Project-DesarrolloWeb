import Paciente from "../models/Paciente.js";
import Turno from "../models/Turno.js";
import { Op } from "sequelize";

// ==========================
// Crear nuevo paciente
// ==========================
export const crearPaciente = async (req, res) => {
  try {
    const { nombre, edad, genero, dpi, direccion } = req.body;

    // Validaciones
    if (!nombre || !edad) {
      return res.status(400).json({ 
        mensaje: "Nombre y edad son obligatorios." 
      });
    }

    // Verificar si el DPI ya existe
    if (dpi) {
      const existePaciente = await Paciente.findOne({ where: { dpi } });
      if (existePaciente) {
        return res.status(400).json({ 
          mensaje: "Ya existe un paciente con este DPI." 
        });
      }
    }

    const nuevoPaciente = await Paciente.create({
      nombre,
      edad,
      genero,
      dpi,
      direccion
    });

    res.status(201).json({
      mensaje: "Paciente registrado exitosamente.",
      paciente: nuevoPaciente
    });
  } catch (error) {
    console.error("Error al crear paciente:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Buscar paciente (por nombre, DPI o ID)
// ==========================
export const buscarPaciente = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        mensaje: "Debe proporcionar al menos 2 caracteres para buscar." 
      });
    }

    const pacientes = await Paciente.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${query}%` } },
          { dpi: { [Op.like]: `%${query}%` } }
        ]
      },
      limit: 20
    });

    res.json({ pacientes });
  } catch (error) {
    console.error("Error al buscar paciente:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Obtener paciente por ID con historial
// ==========================
export const obtenerPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findByPk(id, {
      include: [
        {
          model: Turno,
          include: ['clinica'],
          order: [['fecha', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!paciente) {
      return res.status(404).json({ mensaje: "Paciente no encontrado." });
    }

    res.json({ paciente });
  } catch (error) {
    console.error("Error al obtener paciente:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Listar todos los pacientes (con paginación)
// ==========================
export const listarPacientes = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Paciente.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nombre', 'ASC']]
    });

    res.json({
      total: count,
      pagina: parseInt(page),
      totalPaginas: Math.ceil(count / limit),
      pacientes: rows
    });
  } catch (error) {
    console.error("Error al listar pacientes:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Actualizar paciente
// ==========================
export const actualizarPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, edad, genero, dpi, direccion } = req.body;

    const paciente = await Paciente.findByPk(id);
    if (!paciente) {
      return res.status(404).json({ mensaje: "Paciente no encontrado." });
    }

    // Verificar DPI único si se está cambiando
    if (dpi && dpi !== paciente.dpi) {
      const existeDPI = await Paciente.findOne({ 
        where: { 
          dpi,
          id: { [Op.ne]: id }
        } 
      });
      if (existeDPI) {
        return res.status(400).json({ 
          mensaje: "Ya existe otro paciente con este DPI." 
        });
      }
    }

    await paciente.update({
      nombre: nombre || paciente.nombre,
      edad: edad || paciente.edad,
      genero: genero || paciente.genero,
      dpi: dpi || paciente.dpi,
      direccion: direccion !== undefined ? direccion : paciente.direccion
    });

    res.json({
      mensaje: "Paciente actualizado exitosamente.",
      paciente
    });
  } catch (error) {
    console.error("Error al actualizar paciente:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Eliminar paciente (soft delete opcional)
// ==========================
export const eliminarPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findByPk(id);
    if (!paciente) {
      return res.status(404).json({ mensaje: "Paciente no encontrado." });
    }

    // Verificar si tiene turnos activos
    const turnosActivos = await Turno.count({
      where: {
        pacienteId: id,
        estado: {
          [Op.in]: ['espera', 'llamando', 'atendiendo']
        }
      }
    });

    if (turnosActivos > 0) {
      return res.status(400).json({ 
        mensaje: "No se puede eliminar el paciente porque tiene turnos activos." 
      });
    }

    await paciente.destroy();

    res.json({ mensaje: "Paciente eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar paciente:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};