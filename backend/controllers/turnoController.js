import Turno from "../models/Turno.js";
import Paciente from "../models/Paciente.js";
import Clinica from "../models/Clinica.js";
import Usuario from "../models/Usuario.js";
import HistorialTurno from "../models/HistorialTurno.js";
import { Op } from "sequelize";
import { io } from "../index.js"; // Socket.io instance

// ==========================
// Crear nuevo turno (preclasificación)
// ==========================
export const crearTurno = async (req, res) => {
  try {
    const { pacienteId, clinicaId, motivo, prioridad = 'normal' } = req.body;
    const usuarioId = req.usuario.id; // Del middleware de autenticación

    // Validar que el usuario tenga rol de médico o enfermero
    if (!['medico', 'enfermero', 'admin'].includes(req.usuario.Rol.nombre_rol)) {
      return res.status(403).json({ 
        mensaje: "No tiene permisos para asignar turnos." 
      });
    }

    // Validar existencia de paciente y clínica
    const [paciente, clinica] = await Promise.all([
      Paciente.findByPk(pacienteId),
      Clinica.findByPk(clinicaId)
    ]);

    if (!paciente || !clinica) {
      return res.status(404).json({ 
        mensaje: "Paciente o clínica no encontrado." 
      });
    }

    // Generar número de turno único del día
    const hoy = new Date().toISOString().split('T')[0];
    const turnosHoy = await Turno.count({
      where: {
        clinicaId,
        fecha: hoy
      }
    });

    const numeroTurno = `${clinica.nombre_clinica.substring(0, 3).toUpperCase()}-${String(turnosHoy + 1).padStart(3, '0')}`;

    // Crear turno
    const nuevoTurno = await Turno.create({
      numeroTurno,
      pacienteId,
      clinicaId,
      motivo,
      prioridad,
      estado: 'espera',
      asignadoPorId: usuarioId,
      fecha: hoy
    });

    // Registrar en historial
    await HistorialTurno.create({
      turnoId: nuevoTurno.id,
      estadoAnterior: null,
      estadoNuevo: 'espera',
      usuarioId,
      comentario: 'Turno creado'
    });

    // Obtener turno completo con relaciones
    const turnoCompleto = await Turno.findByPk(nuevoTurno.id, {
      include: [
        { model: Paciente, as: 'paciente' },
        { model: Clinica, as: 'clinica' },
        { model: Usuario, as: 'asignadoPor', attributes: ['id', 'nombre'] }
      ]
    });

    // Notificar en tiempo real
    io.emit('turno:nuevo', turnoCompleto);
    io.to(`clinica-${clinicaId}`).emit('turno:actualizado', turnoCompleto);

    res.status(201).json({
      mensaje: "Turno creado exitosamente.",
      turno: turnoCompleto
    });
  } catch (error) {
    console.error("Error al crear turno:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Obtener cola de turnos por clínica
// ==========================
export const obtenerColaPorClinica = async (req, res) => {
  try {
    const { clinicaId } = req.params;
    const { fecha } = req.query;

    const fechaBusqueda = fecha || new Date().toISOString().split('T')[0];

    const turnos = await Turno.findAll({
      where: {
        clinicaId,
        fecha: fechaBusqueda,
        estado: {
          [Op.in]: ['espera', 'llamando', 'atendiendo']
        }
      },
      include: [
        { 
          model: Paciente, 
          as: 'paciente',
          attributes: ['id', 'nombre', 'edad', 'genero']
        },
        {
          model: Usuario,
          as: 'asignadoPor',
          attributes: ['id', 'nombre']
        }
      ],
      order: [
        ['prioridad', 'DESC'], // Emergencias primero
        ['horaRegistro', 'ASC']
      ]
    });

    res.json({
      clinicaId,
      fecha: fechaBusqueda,
      total: turnos.length,
      turnos
    });
  } catch (error) {
    console.error("Error al obtener cola:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Cambiar estado del turno
// ==========================
export const cambiarEstadoTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoEstado, observaciones } = req.body;
    const usuarioId = req.usuario.id;

    const estadosValidos = ['espera', 'llamando', 'atendiendo', 'finalizado', 'ausente', 'cancelado'];
    if (!estadosValidos.includes(nuevoEstado)) {
      return res.status(400).json({ mensaje: "Estado inválido." });
    }

    const turno = await Turno.findByPk(id);
    if (!turno) {
      return res.status(404).json({ mensaje: "Turno no encontrado." });
    }

    const estadoAnterior = turno.estado;

    // Actualizar timestamps según el estado
    const actualizacion = { estado: nuevoEstado };
    
    if (nuevoEstado === 'llamando' && !turno.horaLlamado) {
      actualizacion.horaLlamado = new Date();
    }
    if (nuevoEstado === 'atendiendo' && !turno.horaInicioAtencion) {
      actualizacion.horaInicioAtencion = new Date();
      actualizacion.atendidoPorId = usuarioId;
    }
    if (['finalizado', 'ausente', 'cancelado'].includes(nuevoEstado) && !turno.horaFinAtencion) {
      actualizacion.horaFinAtencion = new Date();
    }
    if (observaciones) {
      actualizacion.observaciones = observaciones;
    }

    await turno.update(actualizacion);

    // Registrar en historial
    await HistorialTurno.create({
      turnoId: id,
      estadoAnterior,
      estadoNuevo: nuevoEstado,
      usuarioId,
      comentario: observaciones
    });

    const turnoActualizado = await Turno.findByPk(id, {
      include: [
        { model: Paciente, as: 'paciente' },
        { model: Clinica, as: 'clinica' }
      ]
    });

    // Notificar cambio en tiempo real
    io.emit('turno:cambioEstado', turnoActualizado);
    io.to(`clinica-${turno.clinicaId}`).emit('turno:actualizado', turnoActualizado);

    res.json({
      mensaje: "Estado actualizado exitosamente.",
      turno: turnoActualizado
    });
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Obtener siguiente turno (para llamar)
// ==========================
export const obtenerSiguienteTurno = async (req, res) => {
  try {
    const { clinicaId } = req.params;
    const hoy = new Date().toISOString().split('T')[0];

    const siguienteTurno = await Turno.findOne({
      where: {
        clinicaId,
        fecha: hoy,
        estado: 'espera'
      },
      include: [
        { model: Paciente, as: 'paciente' }
      ],
      order: [
        ['prioridad', 'DESC'],
        ['horaRegistro', 'ASC']
      ]
    });

    if (!siguienteTurno) {
      return res.status(404).json({ mensaje: "No hay turnos en espera." });
    }

    res.json({ turno: siguienteTurno });
  } catch (error) {
    console.error("Error al obtener siguiente turno:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Obtener historial de un turno
// ==========================
export const obtenerHistorialTurno = async (req, res) => {
  try {
    const { id } = req.params;

    const historial = await HistorialTurno.findAll({
      where: { turnoId: id },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['timestamp', 'ASC']]
    });

    res.json({ historial });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Estadísticas por clínica
// ==========================
export const obtenerEstadisticasClinica = async (req, res) => {
  try {
    const { clinicaId } = req.params;
    const { fecha } = req.query;
    const fechaBusqueda = fecha || new Date().toISOString().split('T')[0];

    const turnos = await Turno.findAll({
      where: {
        clinicaId,
        fecha: fechaBusqueda
      }
    });

    const estadisticas = {
      total: turnos.length,
      enEspera: turnos.filter(t => t.estado === 'espera').length,
      atendiendo: turnos.filter(t => t.estado === 'atendiendo').length,
      finalizados: turnos.filter(t => t.estado === 'finalizado').length,
      ausentes: turnos.filter(t => t.estado === 'ausente').length,
      tiempoPromedioEspera: 0,
      tiempoPromedioAtencion: 0
    };

    // Calcular tiempos promedio
    const turnosFinalizados = turnos.filter(t => 
      t.horaInicioAtencion && t.horaFinAtencion
    );

    if (turnosFinalizados.length > 0) {
      const tiemposEspera = turnosFinalizados.map(t => 
        (new Date(t.horaInicioAtencion) - new Date(t.horaRegistro)) / 60000
      );
      const tiemposAtencion = turnosFinalizados.map(t => 
        (new Date(t.horaFinAtencion) - new Date(t.horaInicioAtencion)) / 60000
      );

      estadisticas.tiempoPromedioEspera = Math.round(
        tiemposEspera.reduce((a, b) => a + b, 0) / tiemposEspera.length
      );
      estadisticas.tiempoPromedioAtencion = Math.round(
        tiemposAtencion.reduce((a, b) => a + b, 0) / tiemposAtencion.length
      );
    }

    res.json({ estadisticas });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// ==========================
// Obtener turnos para pantalla pública
// ==========================
export const obtenerTurnosPantalla = async (req, res) => {
  try {
    const { clinicaId } = req.query;
    const hoy = new Date().toISOString().split('T')[0];

    const whereClause = { fecha: hoy };
    if (clinicaId) {
      whereClause.clinicaId = clinicaId;
    }

    const turnos = await Turno.findAll({
      where: {
        ...whereClause,
        estado: {
          [Op.in]: ['llamando', 'atendiendo']
        }
      },
      include: [
        { 
          model: Paciente, 
          as: 'paciente',
          attributes: ['nombre'] // Solo nombre para pantalla pública
        },
        {
          model: Clinica,
          as: 'clinica',
          attributes: ['id', 'nombre_clinica']
        }
      ],
      order: [
        ['clinicaId', 'ASC'],
        ['horaLlamado', 'DESC']
      ],
      limit: 10
    });

    res.json({ turnos });
  } catch (error) {
    console.error("Error al obtener turnos para pantalla:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};