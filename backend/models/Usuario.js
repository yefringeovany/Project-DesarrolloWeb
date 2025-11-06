import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";
import Rol from "./Rol.js";

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
});

// RELACIÓN: Un usuario pertenece a un rol
Usuario.belongsTo(Rol, { foreignKey: "rolId" });
Rol.hasMany(Usuario, { foreignKey: "rolId" });

export default Usuario;
