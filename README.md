# API de Gestión de Libros - backend

API REST para gestionar una biblioteca con autenticación JWT y base de datos MongoDB.

## Características

- Autenticación con JWT
- CRUD de libros
- Búsqueda y filtros
- Validación de datos
- Documentación con Swagger

## Tecnologías

- Node.js
- Express.js
- MongoDB
- JWT
- Joi (validación)
- Swagger

## Importante tener presente
- El repositorio tiene las 2 carpetas, para correr el back tienen que acceder primero a cd Backend y luego instalan dependencias, deje el .env con datos de ejemplo por favor cambiarlos por las credenciales asignadas en el correo  para que puedan tener accesi a mi base de datos de mongo, muchas gracias.


### Prerrequisitos

- Node.js
- MongoDB Atlas (o MongoDB local)

### Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno en `.env`:
```env
PORT=5000
MONGODB_URI=tu_mongodb_uri_aqui
JWT_SECRET=tu_jwt_secret_aqui
JWT_EXPIRE=24h
```

3. Ejecutar el proyecto:
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor estará disponible en: http://localhost:5000

## Documentación

La documentación completa de la API está disponible en:
http://localhost:5000/api-docs

## Endpoints principales

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Libros
- `GET /api/books` - Obtener libros
- `POST /api/books` - Crear libro (requiere auth)
- `PUT /api/books/:id` - Actualizar libro (requiere auth)
- `DELETE /api/books/:id` - Eliminar libro (requiere auth)

### Credenciales de login
- Correo : admin@libros.com
- Contraseña : admin1234

o puedes crear un usuario desde la app



# Book Management System - Frontend

Una interfaz web moderna y atractiva para gestionar una biblioteca personal, desarrollada con HTML, CSS y JavaScript vanilla.

## Características

- **Autenticación**: Login y registro de usuarios
- **Dashboard**: Vista general con estadísticas y libros recientes
- **Gestión de Libros**: CRUD completo (Crear, Leer, Actualizar, Eliminar)
- **Filtros**: Búsqueda por título, autor y estado
- **Estados**: Manejo de libros disponibles y reservados
- **Responsive**: Adaptable a diferentes tamaños de pantalla

## Tecnologías

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con variables CSS y Grid/Flexbox
- **JavaScript ES6+**: Lógica de la aplicación con async/await
- **Font Awesome**: Iconos
- **Google Fonts**: Tipografía Inter

## Instalación y Uso

1. **Clonar o descargar** los archivos en tu directorio de trabajo

2. **Abrir la aplicación**:
   - Abre `index.html` en tu navegador web
   - O usa un servidor local como Live Server en VS Code

## Funcionalidades

### Autenticación
- **Login**: Ingresa con email y contraseña
- **Registro**: Crea una nueva cuenta con username, email y contraseña
- **Sesión**: Se mantiene la sesión activa usando localStorage

### Dashboard
- **Estadísticas**: Total de libros, disponibles, reservados y recientes
- **Libros Recientes**: Muestra los últimos libros agregados
- **Vista General**: Información resumida de la biblioteca

### Gestión de Libros
- **Ver Todos**: Lista completa de libros con paginación visual
- **Agregar**: Formulario para crear nuevos libros
- **Editar**: Modificar información de libros existentes
- **Eliminar**: Remover libros con confirmación
- **Cambiar Estado**: Alternar entre disponible y reservado

### Filtros y Búsqueda
- **Búsqueda**: Por título o autor en tiempo real
- **Estado**: Filtrar por disponible/reservado
- **Autor**: Filtro específico por autor
- **Limpiar**: Reset de todos los filtros

## API Integration

### Configuración
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

### Servicios
- **AuthService**: Manejo de login/register
- **BookService**: CRUD de libros
- **ApiClient**: Cliente HTTP con interceptores

### Autenticación
- Token JWT en header `Authorization: Bearer <token>`
- Persistencia en localStorage
- Redirect automático en expiración

## Seguridad

- **XSS Protection**: Escape de HTML en contenido dinámico
- **Token Validation**: Verificación en cada request
- **Input Sanitization**: Validación de formularios

```


Desarrollado por David Santiago Viloria Romero.