const express = require('express');
const BookController = require('../controllers/BookController');
const { authMiddleware } = require('../middleware/auth');
const { validateBody, validateQuery, validateParams, validateMongoId } = require('../validators/validation');
const { bookSchemas, paramSchemas } = require('../validators/schemas');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Libros
 *   description: Endpoints para gestión de libros
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Obtener todos los libros
 *     tags: [Libros]
 *     responses:
 *       200:
 *         description: Lista de libros obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Libros obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 */
router.get('/',
  asyncHandler(BookController.getAllBooks)
);

/**
 * @swagger
 * /api/books/available:
 *   get:
 *     summary: Obtener libros disponibles
 *     tags: [Libros]
 *     responses:
 *       200:
 *         description: Libros disponibles obtenidos exitosamente
 */
router.get('/available',
  asyncHandler(BookController.getAvailableBooks)
);

/**
 * @swagger
 * /api/books/reserved:
 *   get:
 *     summary: Obtener libros reservados
 *     tags: [Libros]
 *     responses:
 *       200:
 *         description: Libros reservados obtenidos exitosamente
 */
router.get('/reserved',
  asyncHandler(BookController.getReservedBooks)
);

/**
 * @swagger
 * /api/books/recent:
 *   get:
 *     summary: Obtener libros recientes
 *     tags: [Libros]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Libros recientes obtenidos exitosamente
 */
router.get('/recent',
  asyncHandler(BookController.getRecentBooks)
);

/**
 * @swagger
 * /api/books/author/{autor}:
 *   get:
 *     summary: Obtener libros por autor
 *     tags: [Libros]
 *     parameters:
 *       - in: path
 *         name: autor
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description: Nombre del autor
 *     responses:
 *       200:
 *         description: Libros del autor obtenidos exitosamente
 */
router.get('/author/:autor',
  validateParams(paramSchemas.bookAuthor),
  asyncHandler(BookController.getBooksByAuthor)
);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Obtener un libro por ID
 *     tags: [Libros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: ID del libro (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Libro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id',
  validateMongoId(),
  asyncHandler(BookController.getBookById)
);

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Crear un nuevo libro (requiere autenticación)
 *     tags: [Libros]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - autor
 *               - anoPublicacion
 *             properties:
 *               titulo:
 *                 type: string
 *                 maxLength: 200
 *                 example: "Cien años de soledad"
 *               autor:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Gabriel García Márquez"
 *               anoPublicacion:
 *                 type: integer
 *                 minimum: 1000
 *                 maximum: 2025
 *                 example: 1967
 *               estado:
 *                 type: string
 *                 enum: [disponible, reservado]
 *                 default: disponible
 *     responses:
 *       201:
 *         description: Libro creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Libro creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/',
  authMiddleware,
  validateBody(bookSchemas.create),
  asyncHandler(BookController.createBook)
);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Actualizar un libro (requiere autenticación)
 *     tags: [Libros]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: ID del libro (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 maxLength: 200
 *               autor:
 *                 type: string
 *                 maxLength: 100
 *               anoPublicacion:
 *                 type: integer
 *                 minimum: 1000
 *                 maximum: 2025
 *               estado:
 *                 type: string
 *                 enum: [disponible, reservado]
 *     responses:
 *       200:
 *         description: Libro actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Libro actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id',
  authMiddleware,
  validateMongoId(),
  validateBody(bookSchemas.update),
  asyncHandler(BookController.updateBook)
);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Eliminar un libro (requiere autenticación)
 *     tags: [Libros]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: ID del libro (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Libro eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Libro eliminado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedBook:
 *                       $ref: '#/components/schemas/Book'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id',
  authMiddleware,
  validateMongoId(),
  asyncHandler(BookController.deleteBook)
);

/**
 * @swagger
 * /api/books/{id}/state:
 *   patch:
 *     summary: Cambiar estado de un libro (requiere autenticación)
 *     tags: [Libros]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: ID del libro (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [disponible, reservado]
 *                 example: "reservado"
 *     responses:
 *       200:
 *         description: Estado del libro cambiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estado del libro cambiado a reservado"
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch('/:id/state',
  authMiddleware,
  validateMongoId(),
  validateBody(bookSchemas.updateState),
  asyncHandler(BookController.changeBookState)
);

module.exports = router;