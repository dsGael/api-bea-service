import { Module } from '@nestjs/common';
import { AlmacenController } from './almacen.controller';
import { AlmacenService } from './almacen.service';
import { MovimientosController } from './movimientos.controller';
import { MovimientosService } from './movimientos.service';

@Module({
  controllers: [AlmacenController, MovimientosController],
  providers: [AlmacenService, MovimientosService],
  exports: [MovimientosService], // por si RefaccionesModule necesita descontar inventario después
})
export class AlmacenModule {}