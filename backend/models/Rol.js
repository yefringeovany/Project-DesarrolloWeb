import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Rol = sequelize.define(
  "Rol",
  {
    id_rol: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre_rol: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    descripcion: {
      type: DataTypes.STRING(150),
    },
  },
  {
    tableName: "Roles",
    timestamps: false,
  }
);

export default Rol;
