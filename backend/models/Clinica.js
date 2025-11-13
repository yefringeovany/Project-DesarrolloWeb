import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

const Clinica = sequelize.define("Clinica", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre_clinica: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
  },
  }, {
  timestamps: false // Evita los errores con createdAt/updatedAt
});

export default Clinica;
