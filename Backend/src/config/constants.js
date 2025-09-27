module.exports = {
  // Configuración del servidor
  SERVER: {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_VERSION: process.env.API_VERSION || 'v1'
  },

  // Configuración JWT
  JWT: {
    SECRET: process.env.JWT_SECRET || 'fallback_secret_key',
    EXPIRE: process.env.JWT_EXPIRE || '24h',
    ALGORITHM: 'HS256'
  },

  // Configuración de la base de datos
  DATABASE: {
    NAME: 'gestion_libros',
    COLLECTION_BOOKS: 'books',
    COLLECTION_USERS: 'users'
  },

  // Estados de libros
  BOOK_STATES: {
    AVAILABLE: 'disponible',
    RESERVED: 'reservado'
  },

  // Configuración de seguridad
  SECURITY: {
    BCRYPT_ROUNDS: 12,
    RATE_LIMIT: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutos
      MAX_REQUESTS: 100
    }
  },

  // Mensajes de respuesta
  MESSAGES: {
    SUCCESS: {
      USER_REGISTERED: 'Usuario registrado exitosamente',
      LOGIN_SUCCESS: 'Login exitoso',
      BOOK_CREATED: 'Libro creado exitosamente',
      BOOK_UPDATED: 'Libro actualizado exitosamente',
      BOOK_DELETED: 'Libro eliminado exitosamente',
      BOOKS_RETRIEVED: 'Libros obtenidos exitosamente'
    },
    ERROR: {
      INVALID_CREDENTIALS: 'Credenciales inválidas',
      USER_EXISTS: 'El usuario ya existe',
      BOOK_NOT_FOUND: 'Libro no encontrado',
      INVALID_TOKEN: 'Token inválido',
      TOKEN_EXPIRED: 'Token expirado',
      INSUFFICIENT_PERMISSIONS: 'Permisos insuficientes',
      VALIDATION_ERROR: 'Error de validación',
      INTERNAL_ERROR: 'Error interno del servidor'
    }
  },

  // Códigos de error
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    DUPLICATE_ERROR: 'DUPLICATE_ERROR',
    INTERNAL_ERROR: 'INTERNAL_SERVER_ERROR'
  }
};