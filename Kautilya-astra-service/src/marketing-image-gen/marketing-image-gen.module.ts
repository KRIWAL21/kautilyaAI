import { Module } from '@nestjs/common';
import { MarketingImageGenController } from './marketing-image-gen.controller';
import { MarketingImageGenService } from './marketing-image-gen.service';

@Module({
  controllers: [MarketingImageGenController],
  providers: [MarketingImageGenService],
})
export class MarketingImageGenModule {}
