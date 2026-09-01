import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { LocalDiskController } from './local-disk.controller';

@Module({
  controllers: [MediaController, LocalDiskController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
