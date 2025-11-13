import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_SERVER, // usa el mismo nombre que tu .env
    dialect: "mssql",
    port: 1433,
    dialectOptions: {
      options: {
        encrypt: false, // true si usas Azure
      },
    },
    logging: false,
  }
);
