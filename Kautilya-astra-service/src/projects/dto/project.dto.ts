import { IsString, IsNumber, IsOptional, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GeoCoordinatesDto {
  @IsNumber()
  lat: number;
  @IsNumber()
  lng: number;
}

export class CollateralSpotDto {
  @IsString()
  id: string;
  @IsNumber()
  x: number;
  @IsNumber()
  y: number;
  @IsEnum(['name', 'number', 'both'])
  label: 'name' | 'number' | 'both';
  @IsNumber() @IsOptional()
  fontSize?: number;
  @IsString() @IsOptional()
  color?: string;
  @IsString() @IsOptional()
  fontWeight?: string;
  @IsString() @IsOptional()
  bgColor?: string;
  @IsNumber() @IsOptional()
  bgOpacity?: number;
}

export class CreateProjectDto {
  @IsString()
  projectName: string;
  @IsString() @IsOptional()
  description?: string;
  @IsString() @IsOptional()
  projectType?: string;
  @IsNumber() @IsOptional()
  minPrice?: number;
  @IsNumber() @IsOptional()
  maxPrice?: number;
  @IsString() @IsOptional()
  projectStatus?: string;
  @IsArray() @IsString({ each: true }) @IsOptional()
  amenities?: string[];
  @IsString() @IsOptional()
  city?: string;
  @IsString() @IsOptional()
  state?: string;
  @IsString() @IsOptional()
  address?: string;
  @IsString() @IsOptional()
  landmark?: string;
  @IsString() @IsOptional()
  reraNo?: string;
  @ValidateNested() @Type(() => GeoCoordinatesDto) @IsOptional()
  coordinates?: GeoCoordinatesDto;
}

export class AddCollateralDto {
  @IsString() @IsOptional()
  imageUrl?: string;
  @IsString() @IsOptional()
  title?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CollateralSpotDto) @IsOptional()
  spots?: CollateralSpotDto[];
}

export class UpdateSpotsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollateralSpotDto)
  spots: CollateralSpotDto[];
}
