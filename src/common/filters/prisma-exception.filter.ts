import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
// Avoid importing '@prisma/client' here to prevent missing-module errors in environments
// where prisma client types are not available. We detect Prisma errors at runtime by name.
import { Response } from 'express';

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Only handle Prisma known request errors
    const isPrismaKnownError = exception?.name === 'PrismaClientKnownRequestError';

    if (isPrismaKnownError && exception.code === 'P2003') {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'No se puede eliminar: este registro está siendo usado en otro lugar del sistema',
      });
    }

    if (isPrismaKnownError && exception.code === 'P2025') {
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Registro no encontrado',
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error inesperado en la base de datos',
    });
  }
}