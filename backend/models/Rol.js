import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

const Rol = sequelize.define("Rol", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre_rol: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  descripcion: {
    type: DataTypes.STRING,
  },descripcion: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: false // Evita los errores con createdAt/updatedAt
});



export default Rol;
