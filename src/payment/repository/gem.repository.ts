import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  gemProducts,
  gemPayments,
  userGems,
  gemTransactions,
} from '@database/schema';
import { InjectDrizzle } from '@/common';
import * as schema from '@/database/schema';
import { GemPaymentCreation } from '@/payment/dto';
import { generateUuidV7 } from '@database/schema/helper';
import { GemReferenceType, GemTransactionType } from '@/types/enum';

@Injectable()
export class GemRepository {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getActiveProducts(): Promise<
    Array<{
      id: string;
      productName: string;
      gemAmount: number;
      bonusGems: number;
      totalGems: number;
      price: number;
      discountRate: number;
      sortOrder: number;
    }>
  > {
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

  async getProductByName(
    name: string,
  ): Promise<typeof schema.gemProducts.$inferSelect | undefined> {
    return this.db.query.gemProducts.findFirst({
      where: eq(schema.gemProducts.productName, name),
    });
  }

  async insertGemPayment(
    userId: string,
    creation: GemPaymentCreation,
  ): Promise<void> {
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

  async transaction(
    userId: string,
    amount: number,
    mode: GemTransactionType,
    referenceType: GemReferenceType,
  ) {
    const trans =
      mode === GemTransactionType.CHARGE
        ? (target: number) => amount + target
        : (target: number) => amount - target;

    await this.safeCreateUserGems(userId);

    await this.db.transaction(async (tx) => {
      const gems = await tx.query.userGems.findFirst({
        where: eq(userGems.userId, userId),
      });

      if (!gems) {
        tx.rollback();
        return;
      }

      await tx.update(userGems).set({
        gemBalance: trans(gems.gemBalance),
        totalCharged: trans(gems.totalCharged),
        lastTransactionAt: new Date(),
      });

      await tx.insert(gemTransactions).values({
        id: generateUuidV7(),
        userId,
        gemAmount: amount,
        transactionType: mode,
        balanceBefore: gems.gemBalance,
        balanceAfter: trans(gems.gemBalance),
        referenceType: referenceType,
      });
    });
  }

  private async safeCreateUserGems(userId: string) {
    const results = await this.db
      .select({
        exists: sql`1`,
      })
      .from(userGems)
      .where(eq(userGems.userId, userId))
      .limit(1);

    const exists = results.length > 0;
    if (!exists) {
      await this.db.insert(userGems).values({
        userId,
        gemBalance: 0,
        totalCharged: 0,
        totalConsumed: 0,
        lastTransactionAt: null,
      });
    }
  }
}
