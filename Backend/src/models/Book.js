const mongoose = require('mongoose');
const { BOOK_STATES } = require('../config/constants');

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - titulo
 *         - autor
 *         - anoPublicacion
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del libro
 *         titulo:
 *           type: string
 *           description: Título del libro
 *           maxLength: 200
 *           example: "Cien años de soledad"
 *         autor:
 *           type: string
 *           description: Autor del libro
 *           maxLength: 100
 *           example: "Gabriel García Márquez"
 *         anoPublicacion:
 *           type: integer
 *           description: Año de publicación del libro
 *           minimum: 1000
 *           maximum: 2025
 *           example: 1967
 *         estado:
 *           type: string
 *           enum: [disponible, reservado]
 *           description: Estado actual del libro
 *           default: disponible
 *           example: "disponible"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del registro
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *       example:
 *         _id: "507f1f77bcf86cd799439011"
 *         titulo: "Cien años de soledad"
 *         autor: "Gabriel García Márquez"
 *         anoPublicacion: 1967
 *         estado: "disponible"
 *         createdAt: "2023-09-06T10:00:00.000Z"
 *         updatedAt: "2023-09-06T10:00:00.000Z"
 */

const bookSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  autor: {
    type: String,
    required: [true, 'El autor es requerido'],
    trim: true,
    maxlength: [100, 'El autor no puede exceder 100 caracteres']
  },
  anoPublicacion: {
    type: Number,
    required: [true, 'El año de publicación es requerido'],
    min: [1000, 'El año de publicación debe ser mayor a 1000'],
    max: [new Date().getFullYear(), 'El año de publicación no puede ser mayor al año actual'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'El año de publicación debe ser un número entero'
    }
  },
  estado: {
    type: String,
    enum: {
      values: Object.values(BOOK_STATES),
      message: `El estado debe ser uno de: ${Object.values(BOOK_STATES).join(', ')}`
    },
    default: BOOK_STATES.AVAILABLE
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para consultas optimizadas
bookSchema.index({ titulo: 'text', autor: 'text' });
bookSchema.index({ autor: 1 });
bookSchema.index({ estado: 1 });
bookSchema.index({ anoPublicacion: 1 });

// Virtual para verificar disponibilidad
bookSchema.virtual('disponible').get(function() {
  return this.estado === BOOK_STATES.AVAILABLE;
});

// Método para cambiar estado
bookSchema.methods.cambiarEstado = function(nuevoEstado) {
  if (!Object.values(BOOK_STATES).includes(nuevoEstado)) {
    throw new Error('Estado inválido');
  }
  this.estado = nuevoEstado;
  return this.save();
};

// Métodos estáticos para consultas comunes
bookSchema.statics.findAvailable = function() {
  return this.find({ estado: BOOK_STATES.AVAILABLE });
};

bookSchema.statics.findReserved = function() {
  return this.find({ estado: BOOK_STATES.RESERVED });
};

bookSchema.statics.findByAuthor = function(autor) {
  return this.find({ autor: new RegExp(autor, 'i') });
};

bookSchema.statics.searchBooks = function(query) {
  return this.find({ $text: { $search: query } });
};

module.exports = mongoose.model('Book', bookSchema);