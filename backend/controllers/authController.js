import Usuario from "../models/Usuario.js";
import Rol from "../models/Rol.js";
import { generarHash, compararHash } from "../utils/hash.js";
import { generarToken } from "../utils/generateToken.js";

// ==========================
// Registro de usuario
// ==========================
export const register = async (req, res) => {
  try {
    const { nombre, email, password, rolId } = req.body;

    // 1️⃣ Verificar si el rol existe
    const rol = await Rol.findByPk(rolId);
    if (!rol) {
      return res.status(400).json({ message: "El rol especificado no existe" });
    }

    // 2️⃣ Si el rol es admin, limitar máximo 2 usuarios
    if (rol.nombre_rol.toLowerCase() === "admin") {
      const totalAdmins = await Usuario.count({ where: { id_rol: rolId } });
      if (totalAdmins >= 2) {
        return res
          .status(403)
          .json({ message: "Ya existen 2 usuarios administradores registrados" });
      }
    }

    // 3️⃣ Verificar si ya existe un usuario con el mismo correo
    const userExists = await Usuario.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "Usuario ya existe" });
    }

    // 4️⃣ Encriptar contraseña
    const hashedPassword = await generarHash(password);

    // 5️⃣ Crear nuevo usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password_hash: hashedPassword,
      id_rol: rolId,
      activo: true,
      //fecha_registro: new Date(), // opcional si tu DB ya lo maneja por default
    });

    // 6️⃣ Obtener usuario con su rol
    const usuarioConRol = await Usuario.findByPk(nuevoUsuario.id_usuario, {
      include: {
        model: Rol,
        attributes: ["id_rol", "nombre_rol"],
      },
    });

    // 7️⃣ Generar token JWT
    const token = generarToken({
      id_usuario: usuarioConRol.id_usuario,
      email: usuarioConRol.email,
      rol: usuarioConRol.Rol.nombre_rol,
    });

    // 8️⃣ Guardar token en DB
    usuarioConRol.token = token;
    await usuarioConRol.save();

    // ✅ Respuesta final
    res.status(201).json({
      message: "Usuario registrado correctamente",
      usuario: usuarioConRol,
      token,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({
      message: "Error al registrar usuario",
      detalle: error.message,
    });
  }
};

// ==========================
// Login de usuario
// ==========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Buscar usuario por email
    const usuario = await Usuario.findOne({
      where: { email },
      include: {
        model: Rol,
        attributes: ["id_rol", "nombre_rol"],
      },
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 2️⃣ Validar contraseña
    const passwordValido = await compararHash(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // 3️⃣ Generar nuevo token JWT
    const token = generarToken({
      id_usuario: usuario.id_usuario,
      email: usuario.email,
      rol: usuario.Rol.nombre_rol,
    });

    // 4️⃣ Guardar token en DB
    usuario.token = token;
    await usuario.save();

    // ✅ Respuesta final
    res.json({
      message: "Login exitoso",
      token,
      rol: usuario.Rol.nombre_rol,
      nombre: usuario.nombre,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      message: "Error al iniciar sesión",
      detalle: error.message,
    });
  }
};
