import { Module } from '@nestjs/common';
import { ChecadorController } from './checador.controller';
import { ChecadorService } from './checador.service';

@Module({
  controllers: [ChecadorController],
  providers: [ChecadorService]
})
export class ChecadorModule {}
