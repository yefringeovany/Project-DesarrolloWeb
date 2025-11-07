import { body, param, query } from 'express-validator';

export const validarCrearTurno = [
  body('pacienteId')
    .isInt({ min: 1 })
    .withMessage('ID de paciente inválido'),
  body('clinicaId')
    .isInt({ min: 1 })
    .withMessage('ID de clínica inválido'),
  body('motivo')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Motivo demasiado largo'),
  body('prioridad')
    .optional()
    .isIn(['normal', 'urgente', 'emergencia'])
    .withMessage('Prioridad inválida')
];

export const validarCambiarEstado = [
  param('id').isInt({ min: 1 }),
  body('nuevoEstado')
    .isIn(['espera', 'llamando', 'atendiendo', 'finalizado', 'ausente', 'cancelado'])
    .withMessage('Estado inválido'),
  body('observaciones')
    .optional()
    .isLength({ max: 1000 })
    .trim()
    .escape()
];