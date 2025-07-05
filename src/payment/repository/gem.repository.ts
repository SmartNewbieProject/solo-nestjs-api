import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { gemProducts } from '@database/schema';
import { InjectDrizzle } from '@/common';
import * as schema from '@/database/schema';

@Injectable()
export class GemRepository {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getActiveProducts() {
    return this.db
      .select({
        id: gemProducts.id,
        productName: gemProducts.productName,
        gemAmount: gemProducts.gemAmount,
        bonusGems: gemProducts.bonusGems,
        totalGems: gemProducts.totalGems,
        price: gemProducts.price,
        discountRate: gemProducts.discountRate,
        sortOrder: gemProducts.sortOrder,
      })
      .from(gemProducts)
      .where(eq(gemProducts.isActive, true))
      .orderBy(gemProducts.sortOrder);
  }
}
