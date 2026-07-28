import { Module } from '@nestjs/common';
import { LaboratorioController } from './laboratorio.controller';
import { LaboratorioService } from './laboratorio.service';

@Module({
  controllers: [LaboratorioController],
  providers: [LaboratorioService]
})
export class LaboratorioModule {}
