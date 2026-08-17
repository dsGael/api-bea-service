import { Module } from '@nestjs/common';
import { CampanaService } from './campana.service';
import { CampanaController } from './campana.controller';

@Module({
  providers: [CampanaService],
  controllers: [CampanaController]
})
export class CampanaModule {}
