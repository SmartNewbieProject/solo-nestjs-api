import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@auth/decorators';
import { GemProductViewer } from '../../services/product-viewer.service';
import { GemProductsResponseDto } from '../../docs/gem-products.dto';
import { Role } from '@auth/domain/user-role.enum';

@Controller('v1/gem')
@ApiTags('구슬(재화)')
@ApiBearerAuth('access-token')
@Roles(Role.USER)
export class GemController {
  constructor(private readonly gemProductViewer: GemProductViewer) {}

  @Get('products')
  @ApiOperation({ summary: '구슬 상품 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '구슬 상품 목록 조회 성공',
    type: GemProductsResponseDto,
  })
  async getGemProducts() {
    return await this.gemProductViewer.getAvailableProducts();
  }
}
