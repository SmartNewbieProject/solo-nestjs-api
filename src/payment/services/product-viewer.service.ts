import { Injectable } from '@nestjs/common';
import { GemRepository } from '../repository/gem.repository';

@Injectable()
export class GemProductViewer {
  constructor(private readonly gemRepository: GemRepository) {}

  async getAvailableProducts() {
    const products = await this.gemRepository.getActiveProducts();

    return products.map((product) => ({
      id: product.id,
      productName: product.productName,
      gemAmount: product.gemAmount,
      bonusGems: product.bonusGems,
      totalGems: product.totalGems,
      price: product.price,
      discountRate: product.discountRate,
      sortOrder: product.sortOrder,
    }));
  }
}
