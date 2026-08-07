import { Module } from '@nestjs/common';
import { RefaccionesController } from './refacciones.controller';
import { RefaccionesService } from './refacciones.service';
import { AlmacenModule } from '../almacen/almacen.module';
import { MinioService } from 'src/storage/minio.service';

@Module({
  imports: [AlmacenModule], 
  controllers: [RefaccionesController],
  providers: [RefaccionesService, MinioService], 
})
export class RefaccionesModule {}