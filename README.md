# 🏥 Sistema Visual de Cola de Turnos para Pacientes

## 📋 Descripción del Proyecto

Sistema web en tiempo real para la gestión eficiente de turnos y colas de atención en centros de salud. Permite al personal médico realizar preclasificación de pacientes, asignarlos a clínicas específicas y gestionar el flujo de atención de manera ordenada y automatizada.

### Problemática

Los centros de salud enfrentan desafíos significativos en la gestión de turnos:
- Procesos manuales que generan desorganización
- Largas esperas y falta de información para los pacientes
- Pérdida de trazabilidad en el proceso de triaje
- Comunicación deficiente entre recepción, personal médico y pacientes
- Duplicidad de registros y errores en la asignación

### Solución

Sistema integral que digitaliza y automatiza:
- **Preclasificación (Triaje)**: Registro y asignación de pacientes a clínicas según evaluación médica
- **Gestión de Colas**: Control en tiempo real del flujo de pacientes
- **Display Informativo**: Pantallas de espera con información actualizada automáticamente
- **Panel Médico**: Herramientas para llamar pacientes, finalizar consultas y gestionar ausencias

## 🚀 Características Principales

- ✅ Registro y clasificación de pacientes
- ✅ Asignación automática de turnos por clínica
- ✅ Actualización en tiempo real mediante WebSockets
- ✅ Panel de control para médicos y personal administrativo
- ✅ Display público para visualización de turnos
- ✅ Historial de consultas y turnos
- ✅ Sistema de autenticación y autorización por roles
- ✅ Gestión de usuarios (médicos, recepcionistas, administradores)

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **Socket.IO** - Comunicación en tiempo real
- **Sequelize** - ORM para base de datos
- **JWT (jsonwebtoken)** - Autenticación
- **Bcrypt** - Encriptación de contraseñas
- **JavaScript** - Lenguaje de programación

### Frontend
- **React 18** - Librería UI
- **Vite** - Build tool y dev server
- **Bootstrap 5** - Framework CSS
- **Socket.IO Client** - Cliente WebSocket
- **React Router** - Navegación

### Base de Datos
- **SQL Server** - Base de datos relacional
- **SmarterASP.NET** - Hosting en la nube
  
## ⚙️ Configuración e Instalación

### Requisitos Previos
- Node.js (v16 o superior)
- SQL Server
- npm o yarn

### 1. Clonar el Repositorio
```bash
git clone [[https://github.com/tu-usuario/sistema-turnos-pacientes.git](https://github.com/yefringeovany/Project-DesarrolloWeb.git)](https://github.com/yefringeovany/Project-DesarrolloWeb.git)
cd sistema-turnos-pacientes
```

### 2. Configuración del Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta `backend`:
```env
PORT=5000
DB_HOST=tu-servidor.database.windows.net
DB_USER=tu-usuario
DB_PASSWORD=tu-contraseña
DB_NAME=nombre-base-datos
DB_PORT=1433
JWT_SECRET=tu-clave-secreta-muy-segura
NODE_ENV=development
```

### 3. Configuración del Frontend

```bash
cd frontend
npm install
```

Crear archivo `.env` en la carpeta `frontend`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Iniciar la Base de Datos

Ejecutar los scripts SQL necesarios para crear las tablas y relaciones en SQL Server.

### 5. Ejecutar el Proyecto

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

El sistema estará disponible en:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 👥 Roles y Permisos

- **Administrador**: Acceso completo al sistema
- **Médico**: Gestión de colas y atención de pacientes
- **Recepcionista**: Registro y preclasificación de pacientes
- **Usuario**: Visualización de información pública

## 🔐 Seguridad

- Autenticación mediante JWT
- Encriptación de contraseñas con Bcrypt
- Validación de datos en backend
- Rate limiting para prevenir ataques
- Variables de entorno para información sensible

## 📱 Funcionalidades por Módulo

### Módulo de Recepción
- Registro de nuevos pacientes
- Preclasificación y asignación a clínicas
- Visualización de colas activas

### Módulo Médico
- Panel de control de turnos
- Llamar siguiente paciente
- Finalizar consultas
- Marcar ausencias

### Display Público
- Visualización de turnos actuales
- Próximos turnos en espera
- Actualización automática en tiempo real

## 🤝 Contribución

Este proyecto fue desarrollado como parte del curso de Desarrollo Web. Para contribuciones:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request
   
## 👨‍💻 Autor

Desarrollado por Yefrin Pérez como proyecto de Frelance.

## 📞 Contacto

- GitHub: [yefringeovany]([https://github.com/tu-usuario](https://github.com/yefringeovany))
- Email: 123perezyefrin@gmail.com

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub!
