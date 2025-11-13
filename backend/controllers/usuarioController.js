// controllers/usuarioController.js
import Usuario from "../models/Usuario.js";
import Rol from "../models/Rol.js";
import Clinica from "../models/Clinica.js";
import { generarHash } from "../utils/hash.js";

// =============================
// 📋 Obtener todos los usuarios
// =============================
export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: [
        { model: Rol, attributes: ["nombre_rol"] },
        { model: Clinica, attributes: ["nombre_clinica"] },
      ],
      attributes: { exclude: ["password"] },
      order: [["id", "ASC"]],
    });

    res.status(200).json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ mensaje: "Error al obtener usuarios." });
  }
};

// =============================
// 🔍 Obtener usuario por ID
// =============================
export const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id, {
      include: [
        { model: Rol, attributes: ["nombre_rol"] },
        { model: Clinica, attributes: ["nombre_clinica"] },
      ],
      attributes: { exclude: ["password"] },
    });

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado." });
    }

    res.status(200).json(usuario);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ mensaje: "Error al obtener usuario." });
  }
};

// =============================
// ➕ Crear nuevo usuario
// =============================
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rolId, clinicaAsignadaId, usuarioActivo } = req.body;

    if (!nombre || !email || !password || !rolId) {
      return res.status(400).json({ mensaje: "Todos los campos requeridos." });
    }

    const existente = await Usuario.findOne({ where: { email } });
    if (existente) {
      return res.status(400).json({ mensaje: "El email ya está registrado." });
    }

    const passwordHasheado = await generarHash(password);

    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password: passwordHasheado,
      rolId,
      clinicaAsignadaId: clinicaAsignadaId || null,
      usuarioActivo: usuarioActivo ?? true,
    });

    const usuarioConRelacion = await Usuario.findByPk(nuevoUsuario.id, {
      include: [{ model: Rol, attributes: ["nombre_rol"] }],
      attributes: { exclude: ["password"] },
    });

    res.status(201).json({
      mensaje: "Usuario creado exitosamente.",
      usuario: usuarioConRelacion,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ mensaje: "Error al crear usuario." });
  }
};

// =============================
// ✏️ Actualizar usuario
// =============================
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rolId, clinicaAsignadaId, usuarioActivo } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado." });
    }

    // Solo actualizar password si se envía uno nuevo
    let datosActualizados = {
      nombre,
      email,
      rolId,
      clinicaAsignadaId,
      usuarioActivo,
    };

    if (password) {
      datosActualizados.password = await generarHash(password);
    }

    await usuario.update(datosActualizados);

    const actualizado = await Usuario.findByPk(id, {
      include: [{ model: Rol, attributes: ["nombre_rol"] }],
      attributes: { exclude: ["password"] },
    });

    res.status(200).json({
      mensaje: "Usuario actualizado correctamente.",
      usuario: actualizado,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ mensaje: "Error al actualizar usuario." });
  }
};

// =============================
// ❌ Eliminar usuario
// =============================
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado." });
    }

    await usuario.destroy();
    res.status(200).json({ mensaje: "Usuario eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ mensaje: "Error al eliminar usuario." });
  }
};