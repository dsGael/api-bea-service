import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { CatalogosModule } from '../catalogos/catalogos.module';

@Module({
  imports: [CatalogosModule], // para usar CatalogosService en la validación
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}