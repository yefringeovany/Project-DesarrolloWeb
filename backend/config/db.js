import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE,     // Nombre de la base de datos
  process.env.DB_USER,         // Usuario de SQL Server
  process.env.DB_PASSWORD,     // Contraseña
  {
    host: process.env.DB_SERVER,
    dialect: "mssql",
    dialectOptions: {
      options: {
        encrypt: false, // Si usas Azure cambia a true
        trustServerCertificate: true,
      },
    },
    logging: false,
  }
);

export default sequelize;
