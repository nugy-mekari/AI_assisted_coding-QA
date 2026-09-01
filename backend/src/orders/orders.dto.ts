import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize, IsArray, IsInt, IsNumber, IsOptional, IsUUID, Min, ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ example: 2, description: 'Quantity of the product' })
  @IsInt()
  qty: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ example: 10, description: 'Percentage discount applied to the subtotal' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_pct?: number;
}
