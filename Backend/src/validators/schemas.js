const Joi = require('joi');
const { BOOK_STATES } = require('../config/constants');

const authSchemas = {
  // Registro de usuario
  register: Joi.object({
    username: Joi.string()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
        'any.required': 'El nombre de usuario es requerido'
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Debe ser un email válido',
        'any.required': 'El email es requerido'
      }),
    
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'any.required': 'La contraseña es requerida'
      })
  }),

  // Inicio de sesión
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Debe ser un email válido',
        'any.required': 'El email es requerido'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'La contraseña es requerida'
      })
  })
};

const bookSchemas = {
  // Crear libro
  create: Joi.object({
    titulo: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': 'El título no puede estar vacío',
        'string.max': 'El título no puede exceder 200 caracteres',
        'any.required': 'El título es requerido'
      }),
    
    autor: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'El autor no puede estar vacío',
        'string.max': 'El autor no puede exceder 100 caracteres',
        'any.required': 'El autor es requerido'
      }),
    
    anoPublicacion: Joi.number()
      .integer()
      .min(1000)
      .max(new Date().getFullYear())
      .required()
      .messages({
        'number.integer': 'El año debe ser un número entero',
        'number.min': 'El año debe ser mayor a 1000',
        'number.max': 'El año no puede ser futuro',
        'any.required': 'El año de publicación es requerido'
      }),
    
    estado: Joi.string()
      .valid(...Object.values(BOOK_STATES))
      .default(BOOK_STATES.AVAILABLE)
      .messages({
        'any.only': `El estado debe ser: ${Object.values(BOOK_STATES).join(' o ')}`
      })
  }),

  // Actualizar libro
  update: Joi.object({
    titulo: Joi.string()
      .min(1)
      .max(200)
      .optional(),
    
    autor: Joi.string()
      .min(1)
      .max(100)
      .optional(),
    
    anoPublicacion: Joi.number()
      .integer()
      .min(1000)
      .max(new Date().getFullYear())
      .optional(),
    
    estado: Joi.string()
      .valid(...Object.values(BOOK_STATES))
      .optional()
  }).min(1).messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar'
  }),

  // Cambiar estado
  updateState: Joi.object({
    estado: Joi.string()
      .valid(...Object.values(BOOK_STATES))
      .required()
      .messages({
        'any.only': `El estado debe ser: ${Object.values(BOOK_STATES).join(' o ')}`,
        'any.required': 'El estado es requerido'
      })
  }),

  // Cambiar estado (alias)
  changeState: Joi.object({
    estado: Joi.string()
      .valid(...Object.values(BOOK_STATES))
      .required()
      .messages({
        'any.only': `El estado debe ser: ${Object.values(BOOK_STATES).join(' o ')}`,
        'any.required': 'El estado es requerido'
      })
  }),

  // Filtros de búsqueda
  queryFilters: Joi.object({
    estado: Joi.string()
      .valid(...Object.values(BOOK_STATES))
      .optional(),
    
    autor: Joi.string()
      .max(100)
      .optional(),
    
    search: Joi.string()
      .min(1)
      .max(100)
      .optional()
  })
};

const paramSchemas = {
  // ID de MongoDB
  mongoId: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'ID inválido',
        'any.required': 'ID requerido'
      })
  }),

  // Nombre del autor
  bookAuthor: Joi.object({
    autor: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'any.required': 'El autor es requerido'
      })
  })
};

module.exports = {
  authSchemas,
  bookSchemas,
  paramSchemas
};