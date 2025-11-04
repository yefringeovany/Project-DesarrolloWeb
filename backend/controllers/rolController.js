// controllers/rolController.js
import Rol from "../models/Rol.js";

// 🟢 Crear un nuevo rol
export const crearRol = async (req, res) => {
  try {
    const { nombre_rol, descripcion } = req.body;

    // Validar campos requeridos
    if (!nombre_rol) {
      return res.status(400).json({ message: "El nombre del rol es obligatorio." });
    }

    // Crear rol en la base de datos
    const nuevoRol = await Rol.create({ nombre_rol, descripcion });

    res.status(201).json({
      message: "Rol creado exitosamente",
      rol: nuevoRol,
    });
  } catch (error) {
    console.error("❌ Error al crear rol:", error);
    res.status(500).json({ message: "Error al crear el rol." });
  }
};

// 🟡 Obtener todos los roles
export const obtenerRoles = async (req, res) => {
  try {
    const roles = await Rol.findAll();
    res.json(roles);
  } catch (error) {
    console.error("❌ Error al obtener roles:", error);
    res.status(500).json({ message: "Error al obtener los roles." });
  }
};

// 🔵 Obtener un rol por ID
export const obtenerRolPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const rol = await Rol.findByPk(id); // Sequelize usa la PK (id_rol)

    if (!rol) {
      return res.status(404).json({ message: "Rol no encontrado." });
    }

    res.json(rol);
  } catch (error) {
    console.error("❌ Error al obtener rol:", error);
    res.status(500).json({ message: "Error al obtener el rol." });
  }
};

// 🟠 Actualizar un rol
export const actualizarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_rol, descripcion } = req.body;

    const rol = await Rol.findByPk(id);

    if (!rol) {
      return res.status(404).json({ message: "Rol no encontrado." });
    }

    await rol.update({ nombre_rol, descripcion });

    res.json({ message: "Rol actualizado correctamente", rol });
  } catch (error) {
    console.error("❌ Error al actualizar rol:", error);
    res.status(500).json({ message: "Error al actualizar el rol." });
  }
};

// 🔴 Eliminar un rol
export const eliminarRol = async (req, res) => {
  try {
    const { id } = req.params;

    const rol = await Rol.findByPk(id);

    if (!rol) {
      return res.status(404).json({ message: "Rol no encontrado." });
    }

    await rol.destroy();

    res.json({ message: "Rol eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar rol:", error);
    res.status(500).json({ message: "Error al eliminar el rol." });
  }
};
