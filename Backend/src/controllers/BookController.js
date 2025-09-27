const BookService = require('../services/BookService');
const { MESSAGES, ERROR_CODES } = require('../config/constants');

class BookController {
  //Obtener todos los libros
  static async getAllBooks(req, res, next) {
    try {
      const books = await BookService.getAllBooks();

      res.status(200).json({
        success: true,
        message: MESSAGES.SUCCESS.BOOKS_RETRIEVED,
        data: books
      });
    } catch (error) {
      next(error);
    }
  }

  //Obtener un libro por ID
  static async getBookById(req, res, next) {
    try {
      const book = await BookService.getBookById(req.params.id);

      res.status(200).json({
        success: true,
        data: book
      });
    } catch (error) {
      if (error.code === ERROR_CODES.NOT_FOUND_ERROR) {
        return res.status(404).json({
          success: false,
          message: error.message,
          error_type: ERROR_CODES.NOT_FOUND_ERROR
        });
      }

      if (error.code === ERROR_CODES.VALIDATION_ERROR) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error_type: ERROR_CODES.VALIDATION_ERROR
        });
      }

      next(error);
    }
  }

  //Crear un nuevo libro
  static async createBook(req, res, next) {
    try {
      const book = await BookService.createBook(req.body);

      res.status(201).json({
        success: true,
        message: MESSAGES.SUCCESS.BOOK_CREATED,
        data: book
      });
    } catch (error) {
      if (error.code === ERROR_CODES.DUPLICATE_ERROR) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error_type: ERROR_CODES.DUPLICATE_ERROR,
          field: error.field
        });
      }

      if (error.code === ERROR_CODES.VALIDATION_ERROR) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error_type: ERROR_CODES.VALIDATION_ERROR,
          validationErrors: error.validationErrors
        });
      }

      next(error);
    }
  }

  //Actualizar un libro
  static async updateBook(req, res, next) {
    try {
      const book = await BookService.updateBook(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: MESSAGES.SUCCESS.BOOK_UPDATED,
        data: book
      });
    } catch (error) {
      if (error.code === ERROR_CODES.NOT_FOUND_ERROR) {
        return res.status(404).json({
          success: false,
          message: error.message,
          error_type: ERROR_CODES.NOT_FOUND_ERROR
        });
      }

      if (error.code === ERROR_CODES.DUPLICATE_ERROR) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error_type: ERROR_CODES.DUPLICATE_ERROR,
          field: error.field
        });
      }

      if (error.code === ERROR_CODES.VALIDATION_ERROR) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error_type: ERROR_CODES.VALIDATION_ERROR,
          validationErrors: error.validationErrors
        });
      }

      next(error);
    }
  }

  //Eliminar un libro
  static async deleteBook(req, res, next) {
    try {
      const deletedBook = await BookService.deleteBook(req.params.id);

      res.status(200).json({
        success: true,
        message: MESSAGES.SUCCESS.BOOK_DELETED,
        data: {
          deletedBook
        }
      });
    } catch (error) {
      if (error.code === ERROR_CODES.NOT_FOUND_ERROR) {
        return res.status(404).json({
          success: false,
          message: error.message,
          error_type: ERROR_CODES.NOT_FOUND_ERROR
        });
      }

      if (error.code === ERROR_CODES.VALIDATION_ERROR) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error_type: ERROR_CODES.VALIDATION_ERROR
        });
      }

      next(error);
    }
  }

  //Cambiar estado de un libro
  static async changeBookState(req, res, next) {
    try {
      const { estado } = req.body;
      const book = await BookService.changeBookState(req.params.id, estado);

      res.status(200).json({
        success: true,
        message: `Estado del libro cambiado a ${estado}`,
        data: book
      });
    } catch (error) {
      if (error.code === ERROR_CODES.NOT_FOUND_ERROR) {
        return res.status(404).json({
          success: false,
          message: error.message,
          error_type: ERROR_CODES.NOT_FOUND_ERROR
        });
      }

      if (error.code === ERROR_CODES.VALIDATION_ERROR) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error_type: ERROR_CODES.VALIDATION_ERROR
        });
      }

      next(error);
    }
  }

  //Obtener libros por autor
  static async getBooksByAuthor(req, res, next) {
    try {
      const { autor } = req.params;
      const books = await BookService.getBooksByAuthor(autor);

      res.status(200).json({
        success: true,
        message: `Libros del autor: ${autor}`,
        data: books
      });
    } catch (error) {
      next(error);
    }
  }

  //Obtener libros disponibles
  static async getAvailableBooks(req, res, next) {
    try {
      const books = await BookService.getBooks({
        estado: 'disponible'
      });

      res.status(200).json({
        success: true,
        message: 'Libros disponibles obtenidos exitosamente',
        data: books
      });
    } catch (error) {
      next(error);
    }
  }

  //Obtener libros reservados
  static async getReservedBooks(req, res, next) {
    try {
      const books = await BookService.getBooks({
        estado: 'reservado'
      });

      res.status(200).json({
        success: true,
        message: 'Libros reservados obtenidos exitosamente',
        data: books
      });
    } catch (error) {
      next(error);
    }
  }

  //Obtener libros recientes
  static async getRecentBooks(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const books = await BookService.getRecentBooks(parseInt(limit));

      res.status(200).json({
        success: true,
        message: 'Libros recientes obtenidos exitosamente',
        data: {
          books,
          total: books.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BookController;