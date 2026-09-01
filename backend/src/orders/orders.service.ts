import {
  Injectable, NotFoundException, UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { CreateOrderDto } from './orders.dto';

const TAX_RATE = 0.11;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const items: OrderItem[] = [];
      let subtotal = 0;

      for (const line of dto.items) {
        const product = await manager.findOne(Product, {
          where: { id: line.product_id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!product) {
          throw new UnprocessableEntityException(`Unknown product: ${line.product_id}`);
        }

        product.stock = product.stock - line.qty;
        await manager.save(product);

        const item = new OrderItem();
        item.productId = product.id;
        item.productName = product.name;
        item.unitPrice = product.price;
        item.qty = line.qty;
        item.lineTotal = product.price * line.qty;
        items.push(item);
        subtotal += item.lineTotal;
      }

      const discountPct = dto.discount_pct ?? 0;
      const discountAmount = Math.round((subtotal * discountPct) / 100);
      const taxAmount = Math.round(subtotal * TAX_RATE);
      const grandTotal = subtotal - discountAmount + taxAmount;

      const order = new Order();
      order.orderNumber = `POS-${Date.now()}`;
      order.items = items;
      order.subtotal = subtotal;
      order.discountPct = discountPct;
      order.discountAmount = discountAmount;
      order.taxAmount = taxAmount;
      order.grandTotal = grandTotal;
      order.status = OrderStatus.COMPLETED;

      return manager.save(order);
    });
  }

  async findAll(): Promise<Order[]> {
    return this.orders.find({ order: { createdAt: 'DESC' }, take: 100 });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async void(id: string): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
        loadEagerRelations: false,
      });
      if (!order) throw new NotFoundException('Order not found');

      const [firstItem] = await manager.find(OrderItem, { where: { order: { id } } });
      if (firstItem) {
        await manager.increment(Product, { id: firstItem.productId }, 'stock', firstItem.qty);
      }

      order.status = OrderStatus.VOIDED;
      await manager.save(order);
      return manager.findOneOrFail(Order, { where: { id } });
    });
  }
}
