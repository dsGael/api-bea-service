import { Module } from '@nestjs/common';
import { LaboratorioController } from './laboratorio.controller';
import { LaboratorioService } from './laboratorio.service';
import { MinioService } from 'src/storage/minio.service';

@Module({
  controllers: [LaboratorioController],
  providers: [LaboratorioService, MinioService], 
})
export class LaboratorioModule {}
