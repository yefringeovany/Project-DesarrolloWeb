import Usuario from "../models/Usuario.js";
import Rol from "../models/Rol.js";
import { generarHash, compararHash } from "../utils/hash.js";
import { generarToken } from "../utils/generateToken.js";

// ==========================
// Registro de usuario
// ==========================
export const register = async (req, res) => {
  try {
    const { nombre, email, password, rolId, clinicaAsignadaId } = req.body;

    // Verificar si el correo ya existe
    const existeUsuario = await Usuario.findOne({ where: { email } });
    if (existeUsuario) {
      return res.status(400).json({ mensaje: "El correo ya está registrado." });
    }

    // Buscar el rol para validar
    const rol = await Rol.findByPk(rolId);
    if (!rol) {
      return res.status(400).json({ mensaje: "Rol no válido." });
    }

    // Si el rol es "Medico", debe tener una clínica asignada
    if (rol.nombre_rol.toLowerCase() === "medico" && !clinicaAsignadaId) {
      return res.status(400).json({
        mensaje: "Debe asignarse una clínica al registrar un médico.",
      });
    }

    // Preparar los datos a registrar
    const datosUsuario = {
      nombre,
      email,
      password: await generarHash(password),
      rolId,
    };

    if (rol.nombre_rol.toLowerCase() === "medico") {
      datosUsuario.clinicaAsignadaId = clinicaAsignadaId;
    }

    const nuevoUsuario = await Usuario.create(datosUsuario);

    res.status(201).json({
      mensaje: "Usuario registrado exitosamente.",
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: rol.nombre_rol,
        clinicaAsignadaId: nuevoUsuario.clinicaAsignadaId || null,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Login de usuario
// ==========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({
      where: { email },
      include: [{ model: Rol }],
    });

    if (!usuario) {
      return res.status(400).json({ mensaje: "Correo o contraseña incorrectos." });
    }

    const passwordValido = await compararHash(password, usuario.password);
    if (!passwordValido) {
      return res.status(400).json({ mensaje: "Correo o contraseña incorrectos." });
    }

    const token = generarToken(usuario);

    res.json({
      mensaje: "Inicio de sesión exitoso.",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.Rol.nombre_rol,
      },
    });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};