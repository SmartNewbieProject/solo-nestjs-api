import { ApiProperty } from '@nestjs/swagger';

export class GemProductDto {
  @ApiProperty({
    description: '상품 ID',
    example: 'product_12345',
  })
  id: string;

  @ApiProperty({
    description: '상품명',
    example: '스타터 팩',
  })
  productName: string;

  @ApiProperty({
    description: '기본 구슬 개수',
    example: 15,
  })
  gemAmount: number;

  @ApiProperty({
    description: '보너스 구슬 개수',
    example: 0,
  })
  bonusGems: number;

  @ApiProperty({
    description: '총 구슬 개수 (기본 + 보너스)',
    example: 15,
  })
  totalGems: number;

  @ApiProperty({
    description: '가격 (원)',
    example: 8800,
  })
  price: number;

  @ApiProperty({
    description: '할인율 (%)',
    example: 0,
  })
  discountRate: number;

  @ApiProperty({
    description: '정렬 순서',
    example: 1,
  })
  sortOrder: number;
}

export class GemProductsResponseDto {
  @ApiProperty({
    description: '구슬 상품 목록',
    type: [GemProductDto],
    example: [
      {
        id: '613cc729-dc80-4312-8dad-43b8c2ece6be',
        productName: '스타터 팩',
        gemAmount: 15,
        bonusGems: 0,
        totalGems: 15,
        price: 8800,
        discountRate: 0,
        sortOrder: 1,
      },
      {
        id: '15e3c44a-b570-4651-95ef-26e506dfde3b',
        productName: '베이직 팩',
        gemAmount: 30,
        bonusGems: 0,
        totalGems: 30,
        price: 14000,
        discountRate: 0,
        sortOrder: 2,
      },
      {
        id: '112e035b-38f4-46d2-924e-58c20409b425',
        productName: '스탠다드 팩',
        gemAmount: 60,
        bonusGems: 0,
        totalGems: 60,
        price: 22000,
        discountRate: 0,
        sortOrder: 3,
      },
      {
        id: 'b83479c6-e227-468d-b9b5-2766d1db62d5',
        productName: '플러스 팩',
        gemAmount: 130,
        bonusGems: 0,
        totalGems: 130,
        price: 39000,
        discountRate: 0,
        sortOrder: 4,
      },
    ],
  })
  data: GemProductDto[];
}
