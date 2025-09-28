const { ERROR_CODES, MESSAGES } = require('../config/constants');

//Middleware global para manejo de errores
const errorHandler = (err, req, res) => {
  // Log detallado del error
  console.error('Error capturado:', {
    name: err.name,
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    userId: req.userId || 'No autenticado'
  });

  let statusCode = 500;
  let message = MESSAGES.ERROR.INTERNAL_ERROR;
  let errorType = ERROR_CODES.INTERNAL_ERROR;
  let details = null;

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Error de validación de datos';
    errorType = ERROR_CODES.VALIDATION_ERROR;
    
    const validationErrors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value,
      kind: error.kind
    }));
    
    details = { validationErrors };
  }

  // Error de clave duplicada 
  else if (err.code === 11000) {
    statusCode = 409;
    errorType = ERROR_CODES.DUPLICATE_ERROR;
    
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `El ${field} '${value}' ya está en uso`;
    
    details = { field, value, duplicateKey: err.keyValue };
  }

  // Error de CastError
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'ID de recurso inválido';
    errorType = ERROR_CODES.VALIDATION_ERROR;
    
    details = {
      field: err.path,
      value: err.value,
      expectedType: err.kind
    };
  }

  // Errores de JWT
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = MESSAGES.ERROR.INVALID_TOKEN;
    errorType = ERROR_CODES.AUTHENTICATION_ERROR;
  }

  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = MESSAGES.ERROR.TOKEN_EXPIRED;
    errorType = ERROR_CODES.AUTHENTICATION_ERROR;
    
    details = {
      expiredAt: err.expiredAt,
      exp: err.exp,
      iat: err.iat
    };
  }

  // Errores de conexión MongoDB
  else if (err.name === 'MongoNetworkError') {
    statusCode = 503;
    message = 'Error de conexión con la base de datos';
    errorType = 'DATABASE_CONNECTION_ERROR';
  }

  else if (err.name === 'MongoServerError') {
    statusCode = 503;
    message = 'Error del servidor de base de datos';
    errorType = 'DATABASE_SERVER_ERROR';
  }

  // Errores personalizados de servicios
  else if (err.code && Object.values(ERROR_CODES).includes(err.code)) {
    errorType = err.code;
    message = err.message;
    
    switch (err.code) {
      case ERROR_CODES.NOT_FOUND_ERROR:
        statusCode = 404;
        break;
      case ERROR_CODES.AUTHENTICATION_ERROR:
        statusCode = 401;
        break;
      case ERROR_CODES.AUTHORIZATION_ERROR:
        statusCode = 403;
        break;
      case ERROR_CODES.VALIDATION_ERROR:
        statusCode = 400;
        break;
      case ERROR_CODES.DUPLICATE_ERROR:
        statusCode = 409;
        break;
      default:
        statusCode = 500;
    }
    
    if (err.validationErrors) {
      details = { validationErrors: err.validationErrors };
    }
    if (err.field) {
      details = { ...details, field: err.field };
    }
  }

  // Error de límite de rate
  else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'El tamaño de la solicitud es demasiado grande';
    errorType = 'PAYLOAD_TOO_LARGE';
  }

  // Error de syntax JSON
  else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'JSON inválido en la solicitud';
    errorType = ERROR_CODES.VALIDATION_ERROR;
  }

  // Construir respuesta de error
  const errorResponse = {
    success: false,
    message,
    error_type: errorType,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // Agregar detalles si existen
  if (details) {
    errorResponse.details = details;
  }

  // Agregar información adicional en desarrollo
  if (process.env.NODE_ENV === 'development') {
    errorResponse.debug = {
      originalError: err.message,
      stack: err.stack,
      name: err.name
    };
  }

  // Agregar request ID si existe
  if (req.requestId) {
    errorResponse.requestId = req.requestId;
  }

  res.status(statusCode).json(errorResponse);
};

// Middleware para manejar rutas no encontradas (404)
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.method} ${req.path}`);
  error.statusCode = 404;
  error.code = ERROR_CODES.NOT_FOUND_ERROR;
  
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
    error_type: ERROR_CODES.NOT_FOUND_ERROR,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    availableEndpoints: {
      auth: '/api/auth',
      books: '/api/books',
      documentation: '/api-docs',
      health: '/health'
    }
  });
};

// Wrapper para funciones async para capturar errores automáticamente
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware para agregar request ID único
const addRequestId = (req, res, next) => {
  req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  addRequestId
};