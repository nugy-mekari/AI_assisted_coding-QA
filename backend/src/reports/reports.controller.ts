import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(value: string | undefined, name: string): string {
  if (!value) throw new BadRequestException(`${name} is required (YYYY-MM-DD)`);
  if (!DATE_RE.test(value) || Number.isNaN(Date.parse(value))) {
    throw new BadRequestException(`${name} must be a valid date in YYYY-MM-DD format`);
  }
  return value;
}

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
  ) {}

  @Get('sales')
  @ApiQuery({ name: 'start_date', example: '2026-08-01' })
  @ApiQuery({ name: 'end_date', example: '2026-08-31' })
  async sales(
    @Query('start_date') startRaw?: string,
    @Query('end_date') endRaw?: string,
  ) {
    const startDate = parseDate(startRaw, 'start_date');
    const endDate = parseDate(endRaw, 'end_date');

    const row = await this.orders
      .createQueryBuilder('o')
      .select('COUNT(o.id)', 'transaction_count')
      .addSelect('COALESCE(SUM(o.subtotal), 0)', 'gross')
      .addSelect('COALESCE(SUM(o.discountAmount), 0)', 'discount')
      .addSelect('COALESCE(SUM(o.taxAmount), 0)', 'tax')
      .addSelect('COALESCE(SUM(o.subtotal - o.discountAmount), 0)', 'net')
      .where('o.createdAt >= :start::date', { start: startDate })
      .andWhere("o.createdAt < :end::date + interval '1 day'", { end: endDate })
      .getRawOne();

    return {
      start_date: startDate,
      end_date: endDate,
      transaction_count: parseInt(row.transaction_count, 10),
      gross: parseInt(row.gross, 10),
      discount: parseInt(row.discount, 10),
      tax: parseInt(row.tax, 10),
      net: parseInt(row.net, 10),
    };
  }
}
