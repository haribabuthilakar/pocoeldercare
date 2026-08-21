import { Module } from '@nestjs/common';
import { SopService } from './sop.service';
import { SopController } from './sop.controller';

@Module({
  providers: [SopService],
  controllers: [SopController],
  exports: [SopService],
})
export class SopModule {}
