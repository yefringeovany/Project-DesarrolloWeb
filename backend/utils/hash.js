import bcrypt from "bcryptjs";

// Función para generar hash de contraseña
export const generarHash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Función para comparar contraseña ingresada con hash
export const compararHash = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
