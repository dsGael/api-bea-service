import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Al llamar a super() con un objeto, bloqueamos la inyección automática 
    // de NestJS y satisfacemos la validación estricta de Prisma.
    super({
      log: ['error'], // Puedes agregar 'query' aquí si quieres ver los SQL en consola después
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}