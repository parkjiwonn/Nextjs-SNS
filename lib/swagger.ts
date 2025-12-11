import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jiwon SNS API',
      version: '1.0.0',
      description: 'Jiwon SNS API 명세서',
    },
    servers: [
      {
        url: 'http://localhost:3003',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./app/api/**/*.ts'], // API 라우트 파일 경로
};

export const swaggerSpec = swaggerJsdoc(options);
