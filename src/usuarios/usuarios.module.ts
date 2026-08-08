import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { MinioService } from 'src/storage/minio.service';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService,MinioService],
  exports: [UsuariosService,],
})
export class UsuariosModule {}