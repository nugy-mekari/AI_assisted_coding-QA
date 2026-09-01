import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @Column({ type: 'uuid' })
  productId: string;

  @Column()
  productName: string;

  @Column({ type: 'int' })
  unitPrice: number;

  @Column({ type: 'int' })
  qty: number;

  @Column({ type: 'int' })
  lineTotal: number;
}
