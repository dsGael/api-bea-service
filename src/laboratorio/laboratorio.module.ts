import { Module } from '@nestjs/common';
import { LaboratorioController } from './laboratorio.controller';
import { LaboratorioService } from './laboratorio.service';
import { DriveService } from 'src/storage/drive/drive.service';

@Module({
  controllers: [LaboratorioController],
  providers: [LaboratorioService, DriveService],
})
export class LaboratorioModule {}
