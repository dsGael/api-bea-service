import { Module } from '@nestjs/common';
import { RefaccionesController } from './refacciones.controller';
import { RefaccionesService } from './refacciones.service';
import { AlmacenModule } from '../almacen/almacen.module';

@Module({
  imports: [AlmacenModule], // para usar MovimientosService
  controllers: [RefaccionesController],
  providers: [RefaccionesService],
})
export class RefaccionesModule {}