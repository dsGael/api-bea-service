import { Module } from '@nestjs/common';
import { RefaccionesController } from './refacciones.controller';
import { RefaccionesService } from './refacciones.service';

@Module({
  controllers: [RefaccionesController],
  providers: [RefaccionesService]
})
export class RefaccionesModule {}
