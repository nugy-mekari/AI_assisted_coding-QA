import {
  Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './orders.dto';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 400 })) id: string) {
    return this.ordersService.findOne(id);
  }

  @Post(':id/void')
  @HttpCode(200)
  void(@Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 400 })) id: string) {
    return this.ordersService.void(id);
  }
}
