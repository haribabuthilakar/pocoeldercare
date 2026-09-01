import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController, PackagesController } from './catalog.controller';

@Module({
  controllers: [CatalogController, PackagesController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
