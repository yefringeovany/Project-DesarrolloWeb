import express from "express";
import { sequelize } from "./models/index.js";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

// Importar modelos (importarlos registra las relaciones en Sequelize)
import "./models/Rol.js";
import "./models/Usuario.js";
import "./models/Paciente.js";
import "./models/Clinica.js";
import "./models/Turno.js";

const app = express();

// =======================
// 🔐 CONFIGURAR CORS
// =======================
app.use(cors({
  origin: "http://localhost:5173", // Dirección del frontend (Vite)
  credentials: true, // Permite cookies y encabezados de autenticación
}));

// Permitir preflight requests (para métodos POST/PUT/DELETE)
//app.options("*", cors());

// =======================
// 🔧 MIDDLEWARES
// =======================
app.use(express.json());

// =======================
// 📦 RUTAS
// =======================
app.use("/api/auth", authRoutes);

// =======================
// 🚀 INICIO DEL SERVIDOR
// =======================
const PORT = process.env.PORT || 5000;

const iniciarServidor = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado correctamente a SQL Server.");

    // Sincroniza modelos sin forzar borrado (no borra tus datos)
    await sequelize.sync({ alter: false });

    app.listen(PORT, () =>
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
    );
  } catch (error) {
    console.error("❌ Error al sincronizar modelos:", error);
  }
};

iniciarServidor();
