import { InjectDrizzle } from "@/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/database/schema";
import { Injectable } from "@nestjs/common";
import { PayBeforeHistory } from "@/types/payment";
import { generateUuidV7 } from "@/database/schema/helper";
import { eq } from "drizzle-orm";

export type CompletionPay = {
  receiptUrl?: string;
  paidAt: Date;
  txId: string;
}

@Injectable()
export default class PayRepository {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  createHistory(payBefore: PayBeforeHistory) {
    return this.db.insert(schema.payHistories).values({
      id: generateUuidV7(),
      userId: payBefore.userId,
      orderId: payBefore.orderId,
      orderName: payBefore.orderName,
      amount: payBefore.amount,
    }).returning();
  }

  findPayHistory(orderId: string) {
    return this.db.query.payHistories.findFirst({
      where: eq(schema.payHistories.orderId, orderId),
    });
  }

  updateHistory(orderId: string, update: CompletionPay) {
    return this.db.update(schema.payHistories).set(update).where(eq(schema.payHistories.orderId, orderId));
  }

}
