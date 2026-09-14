import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AiContentCreatorService } from './ai-content-creator.service';

@Controller('ai-content-creator')
export class AiContentCreatorController {
  constructor(private readonly aiService: AiContentCreatorService) {}

  @Post('perplexity-chat')
  async chat(
    @Body('input') input: string,
    @Body('preset') preset?: string,
  ) {
    return this.aiService.perplexityChat(input, preset);
  }

  @Get('perplexity-chat/history')
  async history(@Query('limit') limit?: string) {
    return this.aiService.fetchPerplexityChatHistory(Number(limit) || 30);
  }
}
