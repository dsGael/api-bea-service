import { NestFactory } from '@nestjs/core';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


(BigInt.prototype as any).toJSON = function () {
  return Number(this); // Lo convierte a un número normal que JSON sí entiende
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configuración base de tu Swagger
  const config = new DocumentBuilder()
    .setTitle('API Sistema BEA')
    .setDescription('Documentación de los endpoints de Catálogos, Envíos y Operaciones')
    .setVersion('1.0')
    .addBearerAuth() // Obligatorio para que aparezca el botón de inyectar tu JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  

  await app.listen(3000);
}
bootstrap();
