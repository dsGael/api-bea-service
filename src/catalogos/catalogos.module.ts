import { Module } from '@nestjs/common';
import { CatalogosController } from './catalogos.controller';
import { CatalogosService } from './catalogos.service';
import { CacheModule } from '@nestjs/cache-manager';


@Module({
  imports: [CacheModule.register({ ttl: 300 })], // 5 minutos
  controllers: [CatalogosController],
  providers: [CatalogosService],
  exports: [CatalogosService], 
})
export class CatalogosModule {}