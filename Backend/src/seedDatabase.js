const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Book = require('./models/Book');
const connectDB = require('./config/database');
const { USER_ROLES } = require('./config/constants');

// DATOS DE PRUEBA PARA USUARIOS
const sampleUsers = [
  {
    username: 'prueba',
    nombre: 'prueba',
    email: 'admin@libros.com',
    password: 'admin1234',
  }
];

// DATOS DE PRUEBA PARA LIBROS
const sampleBooks = [
  {
    titulo: 'Cien años de soledad',
    autor: 'Gabriel García Márquez',
    anoPublicacion: 1967,
    estado: 'disponible'
  },
  {
    titulo: 'Don Quijote de la Mancha',
    autor: 'Miguel de Cervantes',
    anoPublicacion: 1605,
    estado: 'reservado'
  },
  {
    titulo: 'Ficciones',
    autor: 'Jorge Luis Borges',
    anoPublicacion: 1944,
    estado: 'disponible'
  }
];

const seedDatabase = async () => {
  try {
    console.log('Iniciando proceso de seeding...');
    await connectDB();
    
    // Limpiar datos existentes
    console.log('Limpiando datos existentes...');
    await User.deleteMany({});
    await Book.deleteMany({});
    
    // Crear usuarios
    console.log('Creando usuarios...');
    const users = await User.insertMany(sampleUsers);
    console.log(`${users.length} usuarios creados`);
    
    // Crear libros
    console.log(' Creando libros...');
    const books = await Book.insertMany(sampleBooks);
    console.log(`${books.length} libros creados`);
    
    console.log('\n PROCESO COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(50));
    console.log('CREDENCIALES DE ACCESO:');
    console.log('Admin: admin@libros.com / admin123');
    console.log('User: usuario@libros.com / usuario123');
    console.log('API Docs: http://localhost:5000/api-docs');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n Conexión cerrada');
    process.exit(0);
  }
};
// Ejecutar el script si se llama directamente
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;