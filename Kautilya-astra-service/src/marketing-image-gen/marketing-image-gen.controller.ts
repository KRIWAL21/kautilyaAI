import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { MarketingImageGenService } from './marketing-image-gen.service';
import { GenerateMarketingImageDto } from './dto/generate-image.dto';

@Controller('marketing-image-gen')
export class MarketingImageGenController {
  constructor(private readonly service: MarketingImageGenService) {}

  /**
   * POST /marketing-image-gen/generate
   *
   * Equivalent to the full n8n image-generation webhook workflow.
   * Accepts property name + broker info, returns the generated poster URLs.
   *
   * Body: { propertyName, brokerName, brokerNumber, stylingDesc? }
   * Response: { url: string, thumb: string }
   */
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(@Body() dto: GenerateMarketingImageDto) {
    const result = await this.service.generate(
      dto.propertyName,
      dto.brokerName,
      dto.brokerNumber,
      dto.stylingDesc ?? 'standard',
    );
    return result;
  }
}
