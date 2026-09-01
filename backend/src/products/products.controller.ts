import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  @Get()
  findAll() {
    return this.products.find({ order: { name: 'ASC' } });
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 400 })) id: string) {
    return this.products.findOne({ where: { id } });
  }
}
