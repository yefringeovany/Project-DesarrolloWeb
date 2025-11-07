import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";
import Paciente from "./Paciente.js";
import Clinica from "./Clinica.js";
import Usuario from "./Usuario.js";

const Turno = sequelize.define("Turno", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  numeroTurno: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    // Formato: CLI001-001 (clínica-número secuencial del día)
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  horaRegistro: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  horaLlamado: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  horaInicioAtencion: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  horaFinAtencion: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  motivo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  prioridad: {
    type: DataTypes.ENUM('normal', 'urgente', 'emergencia'),
    defaultValue: 'normal',
  },
  estado: {
    type: DataTypes.ENUM('espera', 'llamando', 'atendiendo', 'finalizado', 'ausente', 'cancelado'),
    defaultValue: 'espera',
    allowNull: false,
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tiempoEsperaMinutos: {
    type: DataTypes.VIRTUAL,
    get() {
      const inicio = this.horaRegistro;
      const fin = this.horaInicioAtencion || new Date();
      return Math.floor((fin - inicio) / 60000);
    }
  },
  // Auditoría
  asignadoPorId: {
    type: DataTypes.INTEGER,
    allowNull: false, // Usuario que creó el turno
  },
  atendidoPorId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Usuario que atendió
  }
});

// Relaciones
Turno.belongsTo(Paciente, { foreignKey: "pacienteId", as: "paciente" });
Paciente.hasMany(Turno, { foreignKey: "pacienteId" });

Turno.belongsTo(Clinica, { foreignKey: "clinicaId", as: "clinica" });
Clinica.hasMany(Turno, { foreignKey: "clinicaId" });

Turno.belongsTo(Usuario, { foreignKey: "asignadoPorId", as: "asignadoPor" });
Turno.belongsTo(Usuario, { foreignKey: "atendidoPorId", as: "atendidoPor" });

export default Turno;