import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { gemProducts, gemPayments } from '@database/schema';
import { InjectDrizzle } from '@/common';
import * as schema from '@/database/schema';
import { GemPaymentCreation } from '@/payment/dto';
import { generateUuidV7 } from '@database/schema/helper';

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

  async getProductByName(name: string) {
    return this.db.query.gemProducts.findFirst({
      where: eq(schema.gemProducts.productName, name),
    });
  }

  async insertGemPayment(userId: string, creation: GemPaymentCreation) {
    await this.db.insert(gemPayments).values([
      {
        id: generateUuidV7(),
        userId,
        paymentMethod: 'CARD',
        paymentAmount: Number(creation.amount),
        paidAt: new Date(),
        paymentStatus: 'COMPLETED',
        productId: creation.productId,
        pgTransactionId: creation.transactionId,
        receiptUrl: creation.receiptUrl,
      },
    ]);
  }
}
