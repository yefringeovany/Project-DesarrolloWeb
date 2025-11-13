// controllers/pacienteController.js
import Paciente from "../models/Paciente.js";
import { Op } from "sequelize";

// ==========================
// Crear nuevo paciente
// ==========================
export const crearPaciente = async (req, res) => {
  try {
    const { nombre, edad, genero, dpi, direccion } = req.body;

    // Verificar rol
    const rolUsuario = req.usuario?.Rol?.nombre_rol;
    if (!["admin", "Enfermero"].includes(rolUsuario)) {
      return res.status(403).json({ 
        mensaje: "Solo el administrador o enfermero pueden registrar pacientes." 
      });
    }

    // Validaciones básicas
    if (!nombre || !edad) {
      return res.status(400).json({ mensaje: "Nombre y edad son obligatorios." });
    }

    // Validar DPI único
    if (dpi) {
      const existe = await Paciente.findOne({ where: { dpi } });
      if (existe) {
        return res.status(400).json({ mensaje: "Ya existe un paciente con este DPI." });
      }
    }

    const nuevo = await Paciente.create({ nombre, edad, genero, dpi, direccion });
    res.status(201).json({ mensaje: "Paciente registrado exitosamente.", paciente: nuevo });
  } catch (error) {
    console.error("Error al crear paciente:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Listar pacientes (paginación)
// ==========================
export const listarPacientes = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Paciente.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["nombre", "ASC"]],
    });

    res.json({
      total: count,
      pagina: parseInt(page),
      totalPaginas: Math.ceil(count / limit),
      pacientes: rows,
    });
  } catch (error) {
    console.error("Error al listar pacientes:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Buscar paciente (nombre o DPI)
// ==========================
export const buscarPaciente = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ mensaje: "Debe ingresar al menos 2 caracteres para buscar." });
    }

    const pacientes = await Paciente.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${query}%` } },
          { dpi: { [Op.like]: `%${query}%` } },
        ],
      },
      limit: 20,
    });

    res.json({ pacientes });
  } catch (error) {
    console.error("Error al buscar paciente:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Obtener paciente por ID
// ==========================
export const obtenerPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const paciente = await Paciente.findByPk(id);

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

    // Validar DPI único si se cambia
    if (dpi && dpi !== paciente.dpi) {
      const existeDPI = await Paciente.findOne({
        where: { dpi, id: { [Op.ne]: id } },
      });
      if (existeDPI) {
        return res.status(400).json({ mensaje: "Ya existe otro paciente con este DPI." });
      }
    }

    await paciente.update({ nombre, edad, genero, dpi, direccion });
    res.json({ mensaje: "Paciente actualizado exitosamente.", paciente });
  } catch (error) {
    console.error("Error al actualizar paciente:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Eliminar paciente
// ==========================
export const eliminarPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findByPk(id);
    if (!paciente) {
      return res.status(404).json({ mensaje: "Paciente no encontrado." });
    }

    await paciente.destroy();
    res.json({ mensaje: "Paciente eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar paciente:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};