import Turno from "../models/Turno.js";
import Paciente from "../models/Paciente.js";
import Clinica from "../models/Clinica.js";
import Usuario from "../models/Usuario.js";
import HistorialTurno from "../models/HistorialTurno.js";
import { Op } from "sequelize";
import { io } from "../index.js";

// ==========================
// Crear nuevo turno (preclasificación)
// ==========================
export const crearTurno = async (req, res) => {
  try {
    const { pacienteId, clinicaId, motivo, prioridad = 'normal' } = req.body;
    const usuarioId = req.usuario.id;

    // ✅ SOLO enfermero y admin pueden asignar turnos
    const rolUsuario = req.usuario.Rol.nombre_rol.toLowerCase();
    if (!['enfermero', 'admin'].includes(rolUsuario)) {
      return res.status(403).json({ 
        mensaje: "Solo enfermero o administrador pueden asignar turnos." 
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

    const prefijoClinica = clinica.nombre_clinica
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 3)
      .toUpperCase()
      .padEnd(3, 'X');

    const numeroSecuencial = turnosHoy + 1;
    const fechaCorta = hoy.split('-').slice(1).join('');
    const numeroTurno = `${prefijoClinica}-${clinicaId}-${fechaCorta}-${String(numeroSecuencial).padStart(3, '0')}`;
    
    console.log('🎫 Generando número de turno:', {
      clinica: clinica.nombre_clinica,
      prefijo: prefijoClinica,
      turnosHoy,
      numeroSecuencial,
      numeroTurno
    });

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

    // 🔥 EMISIÓN DE EVENTOS WEBSOCKET
    console.log('📡 [WebSocket] Emitiendo evento turno:nuevo');
    io.emit('turno:nuevo', turnoCompleto);
    io.to(`clinica-${clinicaId}`).emit('turno:actualizado', turnoCompleto);
    io.to('pantalla-publica').emit('turno:nuevo', turnoCompleto);

    res.status(201).json({
      mensaje: "Turno creado exitosamente.",
      turno: turnoCompleto
    });
  } catch (error) {
    console.error("❌ Error al crear turno:", error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        mensaje: "Error al generar número de turno único. Por favor, intente nuevamente."
      });
    }
    
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
        ['prioridad', 'DESC'],
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
        { model: Clinica, as: 'clinica' },
        { model: Usuario, as: 'atendidoPor', attributes: ['id', 'nombre'] }
      ]
    });

    // 🔥 EMISIÓN DE EVENTOS WEBSOCKET
    console.log('📡 [WebSocket] Emitiendo evento turno:cambioEstado');

    io.emit('turno:cambioEstado', {
      ...turnoActualizado.toJSON(),
      estadoAnterior,
      estadoNuevo: nuevoEstado,
      cambioTimestamp: new Date().toISOString()
    });
    
    io.to(`clinica-${turno.clinicaId}`).emit('turno:actualizado', turnoActualizado);
    
    if (['llamando', 'atendiendo', 'finalizado', 'ausente', 'cancelado'].includes(nuevoEstado)) {
      io.to('pantalla-publica').emit('turno:actualizado', turnoActualizado);
    }
    
    if (nuevoEstado === 'llamando') {
      io.emit('turno:llamando', {
        turno: turnoActualizado,
        mensaje: `Turno ${turnoActualizado.numeroTurno} está siendo llamado`,
        prioridad: turnoActualizado.prioridad
      });
    }

    res.json({
      mensaje: "Estado actualizado exitosamente.",
      turno: turnoActualizado
    });
  } catch (error) {
    console.error("❌ Error al cambiar estado:", error);
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
// Obtener Turnos En Espera
// ==========================
export const obtenerTurnosEnEspera = async (req, res) => {
  try {
    const { clinicaId } = req.query;
    const hoy = new Date().toISOString().split('T')[0];

    const whereClause = { fecha: hoy, estado: 'espera' };
    if (clinicaId) {
      whereClause.clinicaId = clinicaId;
    }

    const turnos = await Turno.findAll({
      where: whereClause,
      include: [
        { model: Paciente, as: 'paciente', attributes: ['nombre'] },
        { model: Clinica, as: 'clinica', attributes: ['id', 'nombre_clinica'] }
      ],
      order: [
        ['prioridad', 'DESC'],
        ['horaRegistro', 'ASC']
      ],
      limit: 10
    });

    res.json({ turnos });
  } catch (error) {
    console.error("Error:", error);
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
          attributes: ['nombre']
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

// ==========================
// 👨‍⚕️ FUNCIONES PARA MÉDICOS
// ==========================

// Obtener cola de turnos para el médico autenticado
export const obtenerMiColaTurnos = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const clinicaId = req.usuario.clinicaAsignadaId;
    const { fecha } = req.query;

    const rolUsuario = req.usuario.Rol.nombre_rol.toLowerCase();
    if (rolUsuario !== 'medico') {
      return res.status(403).json({ 
        mensaje: "Solo los médicos pueden acceder a esta función." 
      });
    }

    if (!clinicaId) {
      return res.status(400).json({ 
        mensaje: "El médico no tiene una clínica asignada." 
      });
    }

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
          attributes: ['id', 'nombre', 'edad', 'genero', 'dpi']
        },
        {
          model: Clinica,
          as: 'clinica',
          attributes: ['id', 'nombre_clinica']
        },
        {
          model: Usuario,
          as: 'asignadoPor',
          attributes: ['id', 'nombre']
        },
        {
          model: Usuario,
          as: 'atendidoPor',
          attributes: ['id', 'nombre']
        }
      ],
      order: [
        ['prioridad', 'DESC'],
        ['horaRegistro', 'ASC']
      ]
    });

    const turnosEnEspera = turnos.filter(t => t.estado === 'espera');
    const turnosLlamando = turnos.filter(t => t.estado === 'llamando');
    const turnosAtendiendo = turnos.filter(t => t.estado === 'atendiendo');

    res.json({
      clinicaId,
      clinicaNombre: req.usuario.Clinica?.nombre_clinica,
      fecha: fechaBusqueda,
      total: turnos.length,
      resumen: {
        enEspera: turnosEnEspera.length,
        llamando: turnosLlamando.length,
        atendiendo: turnosAtendiendo.length
      },
      turnos: {
        enEspera: turnosEnEspera,
        llamando: turnosLlamando,
        atendiendo: turnosAtendiendo
      }
    });
  } catch (error) {
    console.error("Error al obtener cola del médico:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// Llamar al siguiente paciente
export const llamarSiguientePaciente = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const clinicaId = req.usuario.clinicaAsignadaId;

    const rolUsuario = req.usuario.Rol.nombre_rol.toLowerCase();
    if (rolUsuario !== 'medico') {
      return res.status(403).json({ 
        mensaje: "Solo los médicos pueden llamar pacientes." 
      });
    }

    if (!clinicaId) {
      return res.status(400).json({ 
        mensaje: "El médico no tiene una clínica asignada." 
      });
    }

    const hoy = new Date().toISOString().split('T')[0];

    const siguienteTurno = await Turno.findOne({
      where: {
        clinicaId,
        fecha: hoy,
        estado: 'espera'
      },
      include: [
        { model: Paciente, as: 'paciente' },
        { model: Clinica, as: 'clinica' }
      ],
      order: [
        ['prioridad', 'DESC'],
        ['horaRegistro', 'ASC']
      ]
    });

    if (!siguienteTurno) {
      return res.status(404).json({ 
        mensaje: "No hay turnos en espera en este momento." 
      });
    }

    await siguienteTurno.update({
      estado: 'llamando',
      horaLlamado: new Date()
    });

    await HistorialTurno.create({
      turnoId: siguienteTurno.id,
      estadoAnterior: 'espera',
      estadoNuevo: 'llamando',
      usuarioId,
      comentario: 'Paciente llamado por el médico'
    });

    const turnoActualizado = await Turno.findByPk(siguienteTurno.id, {
      include: [
        { model: Paciente, as: 'paciente' },
        { model: Clinica, as: 'clinica' },
        { model: Usuario, as: 'asignadoPor', attributes: ['id', 'nombre'] }
      ]
    });

    // 🔥 WEBSOCKET
    io.emit('turno:cambioEstado', {
      ...turnoActualizado.toJSON(),
      estadoAnterior: 'espera',
      estadoNuevo: 'llamando'
    });

    io.to(`clinica-${clinicaId}`).emit('turno:actualizado', turnoActualizado);
    io.to('pantalla-publica').emit('turno:actualizado', turnoActualizado);
    io.emit('turno:llamando', {
      turno: turnoActualizado,
      mensaje: `Turno ${turnoActualizado.numeroTurno} está siendo llamado`,
      prioridad: turnoActualizado.prioridad
    });

    res.json({
      mensaje: "Paciente llamado exitosamente",
      turno: turnoActualizado
    });
  } catch (error) {
    console.error("Error al llamar paciente:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// Iniciar atención
export const iniciarAtencion = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;
    const clinicaId = req.usuario.clinicaAsignadaId;

    const rolUsuario = req.usuario.Rol.nombre_rol.toLowerCase();
    if (rolUsuario !== 'medico') {
      return res.status(403).json({ 
        mensaje: "Solo los médicos pueden iniciar atención." 
      });
    }

    const turno = await Turno.findByPk(id);

    if (!turno) {
      return res.status(404).json({ mensaje: "Turno no encontrado." });
    }

    if (turno.clinicaId !== clinicaId) {
      return res.status(403).json({ 
        mensaje: "No puedes atender turnos de otra clínica." 
      });
    }

    if (turno.estado !== 'llamando') {
      return res.status(400).json({ 
        mensaje: "Solo puedes atender turnos que han sido llamados." 
      });
    }

    const estadoAnterior = turno.estado;

    await turno.update({
      estado: 'atendiendo',
      horaInicioAtencion: new Date(),
      atendidoPorId: usuarioId
    });

    await HistorialTurno.create({
      turnoId: id,
      estadoAnterior,
      estadoNuevo: 'atendiendo',
      usuarioId,
      comentario: 'Atención iniciada'
    });

    const turnoActualizado = await Turno.findByPk(id, {
      include: [
        { model: Paciente, as: 'paciente' },
        { model: Clinica, as: 'clinica' },
        { model: Usuario, as: 'atendidoPor', attributes: ['id', 'nombre'] }
      ]
    });

    // 🔥 WEBSOCKET
    io.emit('turno:cambioEstado', {
      ...turnoActualizado.toJSON(),
      estadoAnterior,
      estadoNuevo: 'atendiendo'
    });

    io.to(`clinica-${clinicaId}`).emit('turno:actualizado', turnoActualizado);
    io.to('pantalla-publica').emit('turno:actualizado', turnoActualizado);

    res.json({
      mensaje: "Atención iniciada exitosamente",
      turno: turnoActualizado
    });
  } catch (error) {
    console.error("Error al iniciar atención:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// Finalizar atención
export const finalizarAtencion = async (req, res) => {
  try {
    const { id } = req.params;
    const { observaciones } = req.body;
    const usuarioId = req.usuario.id;
    const clinicaId = req.usuario.clinicaAsignadaId;

    const rolUsuario = req.usuario.Rol.nombre_rol.toLowerCase();
    if (rolUsuario !== 'medico') {
      return res.status(403).json({ 
        mensaje: "Solo los médicos pueden finalizar atención." 
      });
    }

    const turno = await Turno.findByPk(id);

    if (!turno) {
      return res.status(404).json({ mensaje: "Turno no encontrado." });
    }

    if (turno.clinicaId !== clinicaId) {
      return res.status(403).json({ 
        mensaje: "No puedes finalizar turnos de otra clínica." 
      });
    }

    if (turno.estado !== 'atendiendo') {
      return res.status(400).json({ 
        mensaje: "Solo puedes finalizar turnos que están siendo atendidos." 
      });
    }

    if (turno.atendidoPorId !== usuarioId) {
      return res.status(403).json({ 
        mensaje: "Solo puedes finalizar turnos que tú estás atendiendo." 
      });
    }

    const estadoAnterior = turno.estado;

    await turno.update({
      estado: 'finalizado',
      horaFinAtencion: new Date(),
      observaciones: observaciones || turno.observaciones
    });

    await HistorialTurno.create({
      turnoId: id,
      estadoAnterior,
      estadoNuevo: 'finalizado',
      usuarioId,
      comentario: observaciones || 'Atención finalizada'
    });

    const turnoActualizado = await Turno.findByPk(id, {
      include: [
        { model: Paciente, as: 'paciente' },
        { model: Clinica, as: 'clinica' },
        { model: Usuario, as: 'atendidoPor', attributes: ['id', 'nombre'] }
      ]
    });

    // 🔥 WEBSOCKET
    io.emit('turno:cambioEstado', {
      ...turnoActualizado.toJSON(),
      estadoAnterior,
      estadoNuevo: 'finalizado'
    });

    io.to(`clinica-${clinicaId}`).emit('turno:actualizado', turnoActualizado);
    io.to('pantalla-publica').emit('turno:actualizado', turnoActualizado);

    res.json({
      mensaje: "Atención finalizada exitosamente",
      turno: turnoActualizado
    });
  } catch (error) {
    console.error("Error al finalizar atención:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};