import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";
import Rol from "./Rol.js";
import Clinica from "./Clinica.js";

const Usuario = sequelize.define("Usuario", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  usuarioActivo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  ultimoAcceso: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  clinicaAsignadaId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Solo obligatorio si es médico
  },
});

// Relaciones
Usuario.belongsTo(Rol, { foreignKey: "rolId" });
Rol.hasMany(Usuario, { foreignKey: "rolId" });

Usuario.belongsTo(Clinica, { foreignKey: "clinicaAsignadaId" });
Clinica.hasMany(Usuario, { foreignKey: "clinicaAsignadaId" });

export default Usuario;
