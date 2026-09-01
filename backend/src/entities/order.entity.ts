import {
  Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  COMPLETED = 'COMPLETED',
  VOIDED = 'VOIDED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  orderNumber: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @Column({ type: 'int' })
  subtotal: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })
  discountPct: number;

  @Column({ type: 'int' })
  discountAmount: number;

  @Column({ type: 'int' })
  taxAmount: number;

  @Column({ type: 'int' })
  grandTotal: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.COMPLETED })
  status: OrderStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
