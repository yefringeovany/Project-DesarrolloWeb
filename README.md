# 🏥 Sistema Visual de Cola de Turnos para Pacientes

## 📘 Avance 1: Creación de la Base de Datos en SQL Server

### 🎯 Objetivo del proyecto
Desarrollar un sistema web para gestionar la atención de pacientes en hospitales, clínicas y centros de salud, optimizando la asignación de turnos y la comunicación entre recepción, personal médico y pacientes.  
El sistema permitirá:
- Registrar pacientes.
- Asignarlos a una clínica o consultorio según triaje.
- Administrar la cola de turnos en tiempo real.
- Mostrar en pantallas los pacientes llamados y próximos.
- Controlar el flujo de atención desde el panel médico.

---

## 🧱 Etapa actual: Diseño y creación de la base de datos

### 🗂️ Base de datos: `SistemaColaTurnos`

En esta primera fase se creó la base de datos en **Microsoft SQL Server**, con el propósito de establecer la estructura principal sobre la que funcionará el sistema.  

La base de datos incluye las tablas necesarias para manejar usuarios, roles, pacientes, clínicas y turnos.

---

## 🗄️ Estructura general

| Tabla | Descripción |
|--------|--------------|
| **Roles** | Define los roles del sistema (Administrador, Recepción, Enfermería, Médico). |
| **Usuarios** | Contiene la información del personal que accede al sistema. |
| **Pacientes** | Almacena los datos personales de los pacientes. |
| **Clinicas** | Define las distintas áreas médicas o consultorios. |
| **Turnos** | Registra la cola de atención, estado del turno y asignaciones. |
| **Historial_Atencion** | (Opcional) Guarda información del proceso de atención médica. |

---

## ⚙️ Script SQL utilizado


```sql
CREATE DATABASE BD_colas
GO

USE BD_colas
GO

CREATE TABLE Roles (
    id_rol INT IDENTITY(1,1) PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(150)
)

CREATE TABLE Usuarios (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    activo BIT DEFAULT 1,
    fecha_registro DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (id_rol) REFERENCES Roles(id_rol)
)

CREATE TABLE Pacientes (
    id_paciente INT IDENTITY(1,1) PRIMARY KEY,
    dpi VARCHAR(20) UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    fecha_registro DATETIME DEFAULT GETDATE()
)

CREATE TABLE Clinicas (
    id_clinica INT IDENTITY(1,1) PRIMARY KEY,
    nombre_clinica VARCHAR(100) NOT NULL,
    descripcion VARCHAR(200),
    activo BIT DEFAULT 1
)

CREATE TABLE Turnos (
    id_turno INT IDENTITY(1,1) PRIMARY KEY,
    id_paciente INT NOT NULL,
    id_clinica INT NOT NULL,
    id_asignado_por INT NOT NULL,
    id_atendido_por INT NULL,
    fecha_creacion DATETIME DEFAULT GETDATE(),
    estado VARCHAR(20) CHECK (estado IN ('EN_ESPERA', 'EN_ATENCION', 'FINALIZADO', 'AUSENTE')) DEFAULT 'EN_ESPERA',
    prioridad INT DEFAULT 0,
    observaciones VARCHAR(300),
    FOREIGN KEY (id_paciente) REFERENCES Pacientes(id_paciente),
    FOREIGN KEY (id_clinica) REFERENCES Clinicas(id_clinica),
    FOREIGN KEY (id_asignado_por) REFERENCES Usuarios(id_usuario),
    FOREIGN KEY (id_atendido_por) REFERENCES Usuarios(id_usuario)
)

CREATE TABLE Historial_Atencion (
    id_historial INT IDENTITY(1,1) PRIMARY KEY,
    id_turno INT NOT NULL,
    fecha_inicio DATETIME,
    fecha_fin DATETIME,
    notas VARCHAR(500),
    FOREIGN KEY (id_turno) REFERENCES Turnos(id_turno)
)
