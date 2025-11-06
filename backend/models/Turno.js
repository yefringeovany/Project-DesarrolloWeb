import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";
import Paciente from "./Paciente.js";
import Clinica from "./Clinica.js";

const Turno = sequelize.define("Turno", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  hora: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  motivo: {
    type: DataTypes.STRING,
  },
});

// RELACIONES
Turno.belongsTo(Paciente, { foreignKey: "pacienteId" });
Paciente.hasMany(Turno, { foreignKey: "pacienteId" });

Turno.belongsTo(Clinica, { foreignKey: "clinicaId" });
Clinica.hasMany(Turno, { foreignKey: "clinicaId" });

export default Turno;
