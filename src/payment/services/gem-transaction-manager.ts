import { Injectable } from '@nestjs/common';
import { GemRepository } from '@/payment/repository/gem.repository';
import { GemReferenceType, GemTransactionType } from '@/types/enum';

@Injectable()
export class GemTransactionManager {
  constructor(readonly gemRepository: GemRepository) {}

  async charge(userId: string, amount: number) {
    await this.gemRepository.transaction(
      userId,
      amount,
      GemTransactionType.CHARGE,
      GemReferenceType.PAYMENT,
    );
  }

  async consume(userId: string, amount: number, type: GemReferenceType) {
    await this.gemRepository.transaction(
      userId,
      amount,
      GemTransactionType.CONSUME,
      type,
    );
  }
}
