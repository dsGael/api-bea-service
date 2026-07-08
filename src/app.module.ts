import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatalogosModule } from './catalogos/catalogos.module';
import { TicketsModule } from './tickets/tickets.module';
import { RefaccionesModule } from './refacciones/refacciones.module';
import { AlmacenModule } from './almacen/almacen.module';
import { ChecadorModule } from './checador/checador.module';
import { TecnicosModule } from './tecnicos/tecnicos.module';
import { ChatModule } from './chat/chat.module';
import { EnviosModule } from './envios/envios.module';
import { GastosModule } from './gastos/gastos.module';
import { NominaModule } from './nomina/nomina.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [CatalogosModule, TicketsModule, RefaccionesModule, AlmacenModule, ChecadorModule, TecnicosModule, ChatModule, EnviosModule, GastosModule, NominaModule, AuthModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
