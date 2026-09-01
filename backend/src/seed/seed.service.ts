import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';

const CATALOG: Array<Pick<Product, 'name' | 'sku' | 'price' | 'stock'>> = [
  { name: 'Kopi Susu Gula Aren', sku: 'BEV-001', price: 24000, stock: 120 },
  { name: 'Es Teh Manis', sku: 'BEV-002', price: 12000, stock: 200 },
  { name: 'Americano', sku: 'BEV-003', price: 22000, stock: 80 },
  { name: 'Croissant Butter', sku: 'FOD-001', price: 28000, stock: 35 },
  { name: 'Nasi Goreng Spesial', sku: 'FOD-002', price: 45000, stock: 25 },
  { name: 'Roti Bakar Coklat', sku: 'FOD-003', price: 18000, stock: 40 },
  { name: 'Tumbler Mekari 500ml', sku: 'MRC-001', price: 150000, stock: 2 },
  { name: 'Tote Bag Mekari', sku: 'MRC-002', price: 95000, stock: 0 },
];

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    if ((await this.users.count()) === 0) {
      const cashier = this.users.create({
        email: 'cashier@mekaripos.test',
        name: 'Kasir Satu',
        passwordHash: await bcrypt.hash('PixelPos123!', 10),
      });
      await this.users.save(cashier);
      this.logger.log('Seeded cashier account');
    }
    if ((await this.products.count()) === 0) {
      await this.products.save(this.products.create(CATALOG));
      this.logger.log(`Seeded ${CATALOG.length} products`);
    }
  }
}
