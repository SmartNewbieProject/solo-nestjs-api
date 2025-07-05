import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '@auth/decorators';
import { GemProductViewer } from '../../services/product-viewer.service';
import { GemProductsResponseDto } from '../../docs/gem-products.dto';
import { Role } from '@auth/domain/user-role.enum';
import { AuthenticationUser } from '@/types';
import { PaymentConfirm } from '@/payment/dto';
import { GemPaymentService } from '@/payment/services/gem-payment.service';

@Controller('v1/gem')
@ApiTags('구슬(재화)')
@ApiBearerAuth('access-token')
@Roles(Role.USER)
export class GemController {
  constructor(
    private readonly gemProductViewer: GemProductViewer,
    private readonly gemPaymentService: GemPaymentService,
  ) {}

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

  @ApiOperation({
    summary: '구슬(재화) 결제 내용 서버 저장',
    description:
      'PortOne 으로부터 결제창 이후 전달받은 값을 서버로 전송해 교차검증을 진행합니다.',
  })
  @Post('confirm')
  async confirmPayment(
    @CurrentUser() user: AuthenticationUser,
    @Body() payment: PaymentConfirm,
  ) {
    return await this.gemPaymentService.confirm(user.id, payment);
  }
}
