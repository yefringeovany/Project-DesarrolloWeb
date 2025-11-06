import express from "express";
import { sequelize } from "./models/index.js";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

// Importar modelos
import "./models/Rol.js";
import "./models/Usuario.js";
import "./models/Paciente.js";
import "./models/Clinica.js";
import "./models/Turno.js";

const app = express();
app.use(express.json());

//Rutas
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

const iniciarServidor = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado correctamente a SQL Server.");

        await sequelize.sync();

    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
  } catch (error) {
    console.error("❌ Error al sincronizar modelos:", error);
  }
};

iniciarServidor();
