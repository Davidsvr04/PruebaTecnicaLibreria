const Book = require('../models/Book');
const { BOOK_STATES, ERROR_CODES } = require('../config/constants');

class BookService {
  // Obtener todos los libros
  static async getAllBooks() {
    try {
      return await Book.find().sort({ createdAt: -1 });
    } catch (error) {
      const serviceError = new Error('Error al obtener los libros');
      serviceError.code = ERROR_CODES.INTERNAL_ERROR;
      serviceError.originalError = error;
      throw serviceError;
    }
  }
  // Obtener libro por ID
  static async getBookById(bookId) {
    try {
      const book = await Book.findById(bookId);
      if (!book) {
        const error = new Error('Libro no encontrado');
        error.code = ERROR_CODES.NOT_FOUND_ERROR;
        throw error;
      }
      return book;
    } catch (error) {
      if (error.name === 'CastError') {
        const castError = new Error('ID de libro inválido');
        castError.code = ERROR_CODES.VALIDATION_ERROR;
        throw castError;
      }
      if (error.code === ERROR_CODES.NOT_FOUND_ERROR) {
        throw error;
      }
      const serviceError = new Error('Error al obtener el libro');
      serviceError.code = ERROR_CODES.INTERNAL_ERROR;
      serviceError.originalError = error;
      throw serviceError;
    }
  }
  // Crear un nuevo libro
  static async createBook(bookData) {
    try {
      const book = new Book(bookData);
      await book.save();
      return book;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationError = new Error('Datos de libro inválidos');
        validationError.code = ERROR_CODES.VALIDATION_ERROR;
        validationError.validationErrors = error.errors;
        throw validationError;
      }
      const serviceError = new Error('Error al crear el libro');
      serviceError.code = ERROR_CODES.INTERNAL_ERROR;
      serviceError.originalError = error;
      throw serviceError;
    }
  }
  // Actualizar un libro existente
  static async updateBook(bookId, updateData) {
    try {
      const book = await Book.findByIdAndUpdate(bookId, updateData, { 
        new: true, 
        runValidators: true,
        context: 'query'
      });
      if (!book) {
        const error = new Error('Libro no encontrado');
        error.code = ERROR_CODES.NOT_FOUND_ERROR;
        throw error;
      }
      return book;
    } catch (error) {
      if (error.name === 'CastError') {
        const castError = new Error('ID de libro inválido');
        castError.code = ERROR_CODES.VALIDATION_ERROR;
        throw castError;
      }
      if (error.name === 'ValidationError') {
        const validationError = new Error('Datos de actualización inválidos');
        validationError.code = ERROR_CODES.VALIDATION_ERROR;
        validationError.validationErrors = error.errors;
        throw validationError;
      }
      if (error.code === ERROR_CODES.NOT_FOUND_ERROR) {
        throw error;
      }
      const serviceError = new Error('Error al actualizar el libro');
      serviceError.code = ERROR_CODES.INTERNAL_ERROR;
      serviceError.originalError = error;
      throw serviceError;
    }
  }
  // Eliminar un libro
  static async deleteBook(bookId) {
    try {
      const book = await Book.findByIdAndDelete(bookId);
      if (!book) {
        const error = new Error('Libro no encontrado');
        error.code = ERROR_CODES.NOT_FOUND_ERROR;
        throw error;
      }
      return book;
    } catch (error) {
      if (error.name === 'CastError') {
        const castError = new Error('ID de libro inválido');
        castError.code = ERROR_CODES.VALIDATION_ERROR;
        throw castError;
      }
      if (error.code === ERROR_CODES.NOT_FOUND_ERROR) {
        throw error;
      }
      const serviceError = new Error('Error al eliminar el libro');
      serviceError.code = ERROR_CODES.INTERNAL_ERROR;
      serviceError.originalError = error;
      throw serviceError;
    }
  }
  // Cambiar el estado de un libro
  static async changeBookState(bookId, newState) {
    try {
      if (!Object.values(BOOK_STATES).includes(newState)) {
        const error = new Error('Estado de libro inválido');
        error.code = ERROR_CODES.VALIDATION_ERROR;
        throw error;
      }
      return await this.updateBook(bookId, { estado: newState });
    } catch (error) {
      throw error;
    }
  }
  // Obtener libros con filtros
  static async getBooks(options = {}) {
    try {
      const { estado, autor } = options;
      
      // Construir filtros
      const filters = {};
      
      if (estado && Object.values(BOOK_STATES).includes(estado)) {
        filters.estado = estado;
      }
      
      if (autor) {
        filters.autor = new RegExp(autor, 'i');
      }

      // Ejecutar consulta simple
      const books = await Book.find(filters).sort({ createdAt: -1 });

      return books;
    } catch (error) {
      const serviceError = new Error('Error al obtener libros');
      serviceError.code = ERROR_CODES.INTERNAL_ERROR;
      serviceError.originalError = error;
      throw serviceError;
    }
  }
  // Obtener libros por Autor
  static async getBooksByAuthor(autor) {
    return await this.getBooks({ autor });
  }
  // Obtener libros recientes
  static async getRecentBooks(limit = 10) {
    try {
      return await Book.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('titulo autor anoPublicacion estado createdAt');
    } catch (error) {
      const serviceError = new Error('Error al obtener libros recientes');
      serviceError.code = ERROR_CODES.INTERNAL_ERROR;
      serviceError.originalError = error;
      throw serviceError;
    }
  }
}

module.exports = BookService;