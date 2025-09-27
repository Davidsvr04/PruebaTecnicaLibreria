// Configuración de variables de entorno - DEBE SER PRIMERO
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/database');
const swaggerConfig = require('./config/swagger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Rutas
const authRoutes = require('./routes/auth.routes');
const bookRoutes = require('./routes/books.routes');
const app = express();

// CORS
app.use(cors());

// Parseo de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DOCUMENTACIÓN API - SWAGGER
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));

// Ruta principal
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API de Gestión de Libros',
    data: {
      version: '1.0.0',
      documentation: '/api-docs',
      auth: '/api/auth',
      books: '/api/books'
    }
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
// Manejo de errores y rutas no encontradas
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB conectado');

    server = app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en puerto ${PORT}`);
      console.log(`Documentación: http://localhost:${PORT}/api-docs`);
    });

  } catch (error) {
    console.error('Error al iniciar servidor:', error.message);
    process.exit(1);
  }
};

// Manejo de cierre
const gracefulShutdown = async () => {
  console.log('Cerrando servidor...');
  
  try {
    if (server) {
      server.close(() => console.log('Servidor HTTP cerrado'));
    }
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB desconectado');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error al cerrar:', error);
    process.exit(1);
  }
};

// Escuchar señales de cierre
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Iniciar servidor
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };