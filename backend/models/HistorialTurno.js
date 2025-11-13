import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";
import Turno from "./Turno.js";
import Usuario from "./Usuario.js";

const HistorialTurno = sequelize.define("HistorialTurno", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  turnoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estadoAnterior: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  estadoNuevo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
},
  {
  tableName: "HistorialTurnos", // 👈 fuerza este nombre
  freezeTableName: true,        // 👈 evita pluralización automática
  timestamps: true,             // 👈 mantiene createdAt y updatedAt
});

HistorialTurno.belongsTo(Turno, { foreignKey: "turnoId" });
HistorialTurno.belongsTo(Usuario, { foreignKey: "usuarioId", as: "usuario" });

export default HistorialTurno;