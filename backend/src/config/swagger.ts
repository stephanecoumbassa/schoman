/**
 * Swagger API Documentation Configuration
 * 
 * This file configures Swagger/OpenAPI documentation for the Schoman API.
 * The documentation is available at /api-docs endpoint.
 */

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Schoman API',
      version: '2.0.0',
      description: 'API de gestion scolaire complète - Schoman School Management System',
      contact: {
        name: 'Schoman Team',
        email: 'support@schoman.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.schoman.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        // User Schema
        User: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName', 'role'],
          properties: {
            _id: { type: 'string', description: 'User ID' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: {
              type: 'string',
              enum: ['admin', 'teacher', 'student', 'parent'],
            },
            phone: { type: 'string' },
            address: { type: 'string' },
            avatar: { type: 'string' },
            school: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },

        // School Schema
        School: {
          type: 'object',
          required: ['name', 'code', 'address', 'city', 'country', 'phone', 'email'],
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'École Primaire Exemple' },
            code: { type: 'string', example: 'SCH001' },
            address: { type: 'string' },
            city: { type: 'string' },
            country: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            website: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },

        // Error Response
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            statusCode: { type: 'number' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Authentication', description: 'Authentication endpoints' },
      { name: 'Schools', description: 'School management endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Students', description: 'Student management endpoints' },
      { name: 'Classes', description: 'Class management endpoints' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export default swaggerOptions;
