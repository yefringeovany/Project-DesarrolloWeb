// backend/models/Usuario.js
import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../config/db.js";
import Rol from "./Rol.js";

const Usuario = sequelize.define(
  "Usuario",
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: true,        // 👈 Permite nulo
      defaultValue: null,     // 👈 Sequelize no enviará la fecha
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "Usuarios",
    timestamps: false,
  }
);

Usuario.belongsTo(Rol, { foreignKey: "id_rol" });

export default Usuario;
