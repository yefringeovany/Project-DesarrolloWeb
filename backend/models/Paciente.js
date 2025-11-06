import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

const Paciente = sequelize.define("Paciente", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  edad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  genero: {
    type: DataTypes.STRING,
  },
  dpi: {
    type: DataTypes.STRING,
    unique: true,
  },
  direccion: {
    type: DataTypes.STRING,
  },
});

export default Paciente;
