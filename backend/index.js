import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { sequelize } from "./models/index.js";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import { loginLimiter, creacionLimiter } from "./middlewares/rateLimiters.js";

// Importar rutas
import authRoutes from "./routes/authRoutes.js";
// Descomentar cuando implementes estos archivos:
import turnoRoutes from "./routes/turnoRoutes.js";
import pacienteRoutes from "./routes/pacienteRoutes.js";
 import clinicaRoutes from "./routes/clinicaRoutes.js";
// import usuarioRoutes from "./routes/usuarioRoutes.js";

dotenv.config();

// Importar modelos (importarlos registra las relaciones en Sequelize)
import "./models/Rol.js";
import "./models/Usuario.js";
import "./models/Paciente.js";
import "./models/Clinica.js";
import "./models/Turno.js";
import "./models/HistorialTurno.js";

const app = express();
const httpServer = createServer(app);

// =======================
// 🔐 CONFIGURAR CORS
// =======================
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

// =======================
// 🔧 MIDDLEWARES
// =======================
app.use(express.json());

// 🛡️ Helmet - Seguridad de cabeceras HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Middleware para logging de requests (opcional pero útil)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// =======================
// 📡 CONFIGURAR SOCKET.IO
// =======================
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Middleware de autenticación para Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  // Permitir conexiones sin token (para pantallas públicas)
  if (!token) {
    socket.data.authenticated = false;
    socket.data.isPublic = true;
    return next();
  }

  // Verificar token si existe
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.userId = decoded.id;
    socket.data.authenticated = true;
    socket.data.isPublic = false;
    next();
  } catch (error) {
    console.error('❌ Token inválido en Socket.IO:', error.message);
    return next(new Error('Token inválido'));
  }
});

// Manejadores de eventos Socket.IO
io.on('connection', (socket) => {
  const userType = socket.data.isPublic ? 'Público' : `Usuario ${socket.data.userId}`;
  console.log(`🔌 Cliente conectado: ${socket.id} (${userType})`);

  // Unirse a sala de clínica específica
  socket.on('join:clinica', (clinicaId) => {
    socket.join(`clinica-${clinicaId}`);
    console.log(`👤 Socket ${socket.id} unido a clinica-${clinicaId}`);
    socket.emit('joined:clinica', { clinicaId, message: 'Conectado a la clínica' });
  });

  // Salir de sala de clínica
  socket.on('leave:clinica', (clinicaId) => {
    socket.leave(`clinica-${clinicaId}`);
    console.log(`👤 Socket ${socket.id} salió de clinica-${clinicaId}`);
  });

  // Unirse a sala de pantalla pública
  socket.on('join:pantalla', () => {
    socket.join('pantalla-publica');
    console.log(`📺 Socket ${socket.id} unido a pantalla pública`);
    socket.emit('joined:pantalla', { message: 'Conectado a pantalla pública' });
  });

  // Solicitar actualización inmediata de datos
  socket.on('request:update', (data) => {
    console.log(`🔄 Solicitud de actualización de: ${socket.id}`, data);
    // El cliente debe hacer una petición HTTP para obtener los datos actualizados
    socket.emit('request:fetch-turnos', data);
  });

  // Manejar desconexión
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Cliente desconectado: ${socket.id} - Razón: ${reason}`);
  });

  // Manejar errores
  socket.on('error', (error) => {
    console.error(`❌ Error en socket ${socket.id}:`, error);
  });
});

// Exportar io para usarlo en los controladores
export { io };

// =======================
// 📦 RUTAS
// =======================
app.use("/api/auth/login", loginLimiter);

app.use("/api/auth", authRoutes);

// Descomentar cuando implementes estos archivos:
 app.use("/api/turnos", turnoRoutes);
 app.use("/api/pacientes", pacienteRoutes);
app.use("/api/clinicas", clinicaRoutes);
// app.use("/api/usuarios", usuarioRoutes);

// Ruta de health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    socketConnections: io.engine.clientsCount,
    database: sequelize.connectionManager.pool ? "connected" : "disconnected"
  });
});

// Ruta 404 - No encontrado
app.use((req, res) => {
  res.status(404).json({ 
    mensaje: "Ruta no encontrada",
    path: req.path 
  });
});

// Middleware de manejo de errores global
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  
  res.status(error.status || 500).json({
    mensaje: error.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// =======================
// 🚀 INICIO DEL SERVIDOR
// =======================
const PORT = process.env.PORT || 5000;

const iniciarServidor = async () => {
  try {
    // Probar conexión a la base de datos
    await sequelize.authenticate();
    console.log("✅ Conectado correctamente a SQL Server.");

    // Sincroniza modelos sin forzar borrado (no borra tus datos)
    // Cambiar a { alter: true } solo en desarrollo cuando hagas cambios en modelos
    await sequelize.sync({ alter: false });
    console.log("✅ Modelos sincronizados con la base de datos.");

    // Iniciar servidor HTTP con Socket.IO
    httpServer.listen(PORT, () => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📡 Socket.IO listo para conexiones en tiempo real`);
      console.log(`🌐 API disponible en: http://localhost:${PORT}/api`);
      console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
      console.log(`${'='.repeat(50)}\n`);
    });

  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    console.error("Stack:", error.stack);
    process.exit(1); // Terminar el proceso si hay error crítico
  }
};

// Manejar errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Promesa rechazada no manejada:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

// Manejar cierre graceful
process.on('SIGTERM', async () => {
  console.log('⚠️ SIGTERM recibido. Cerrando servidor...');
  
  // Cerrar conexiones de Socket.IO
  io.close(() => {
    console.log('📡 Socket.IO cerrado');
  });
  
  // Cerrar servidor HTTP
  httpServer.close(() => {
    console.log('🚀 Servidor HTTP cerrado');
  });
  
  // Cerrar conexión a base de datos
  await sequelize.close();
  console.log('🗄️ Conexión a base de datos cerrada');
  
  process.exit(0);
});

iniciarServidor();