import { Module } from '@nestjs/common';
import { AiContentCreatorController } from './ai-content-creator.controller';
import { AiContentCreatorService } from './ai-content-creator.service';

@Module({
  controllers: [AiContentCreatorController],
  providers: [AiContentCreatorService],
})
export class AiContentCreatorModule {}
