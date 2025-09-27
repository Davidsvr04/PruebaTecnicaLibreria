/**
 * Configuración de Swagger/OpenAPI
 */
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestión de Libros',
      version: '1.0.0',
      description: `
        API REST completa para la gestión de libros con autenticación JWT.
        
        ## Características principales:
        - CRUD completo de libros
        - Autenticación y autorización con JWT
        - Búsqueda y filtrado avanzado
        - Paginación de resultados
        - Validación robusta de datos
        - Manejo de errores estructurado
        
        ## Autenticación
        Para acceder a endpoints protegidos, incluye el token JWT en el header Authorization:
        \`Authorization: Bearer <token>\`
        
        ## Base de datos
        - Base de datos: gestion_libros
        - Colección: books y Users
        - Provider: MongoDB Atlas
      `,
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint de login'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acceso faltante o inválido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Token de acceso requerido' },
                  error: { type: 'string', example: 'NO_TOKEN' }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Error de validación de datos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Datos de entrada inválidos' },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string' },
                        message: { type: 'string' },
                        value: {}
                      }
                    }
                  },
                  error_type: { type: 'string', example: 'VALIDATION_ERROR' }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Recurso no encontrado' },
                  error_type: { type: 'string', example: 'RESOURCE_NOT_FOUND' }
                }
              }
            }
          }
        },
        ServerError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Error interno del servidor' },
                  error_type: { type: 'string', example: 'INTERNAL_SERVER_ERROR' }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/models/*.js',
    './src/controllers/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;