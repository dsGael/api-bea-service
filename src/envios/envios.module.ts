import { Module } from '@nestjs/common';
import { EnviosController } from './envios.controller';
import { EnviosService } from './envios.service';
import { MinioService } from 'src/storage/minio.service';

@Module({
  controllers: [EnviosController],
  providers: [EnviosService, MinioService],
})
export class EnviosModule {}