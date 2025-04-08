import { InjectDrizzle } from "@/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/database/schema";
import { Injectable } from "@nestjs/common";
import { PayBeforeHistory } from "@/types/payment";
import { generateUuidV7 } from "@/database/schema/helper";

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

}
