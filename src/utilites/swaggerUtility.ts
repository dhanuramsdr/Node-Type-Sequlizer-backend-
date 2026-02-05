import swaggerJsdoc from 'swagger-jsdoc'

export const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API with Swagger',
      version: '1.0.0',
      description: 'API Documentation',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'http://localhost:3000/api/v1',
        description: 'API Base URL'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    tags: [
      {
        name: 'Products',
        description: 'Product management'
      },
      {
        name: 'Users',
        description: 'User management'
      }
    ]
  },
  // IMPORTANT: Make sure these paths are correct
  apis: [
    './src/routes/*.ts',
    './src/routes/**/*.ts',
    './src/controllers/*.ts',
    './src/controllers/**/*.ts'
  ]
}