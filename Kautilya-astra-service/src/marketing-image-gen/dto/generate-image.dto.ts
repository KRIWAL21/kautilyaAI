import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class GenerateMarketingImageDto {
  @IsString()
  @IsNotEmpty()
  propertyName: string;

  @IsString()
  @IsNotEmpty()
  brokerName: string;

  @IsString()
  @IsNotEmpty()
  brokerNumber: string;

  @IsString()
  @IsOptional()
  stylingDesc?: string;
}
