const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
    console.log(`Base de datos: ${conn.connection.name}`);
    
    mongoose.set('strictQuery', false);
    
    mongoose.connection.on('error', (err) => {
      console.error('Error de conexión MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB desconectado');
    });
    
    // Manejo de cierre graceful
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Conexión MongoDB cerrada por terminación de la aplicación');
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;