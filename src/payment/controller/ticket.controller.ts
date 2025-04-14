import { Role } from '@/auth/domain/user-role.enum';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TicketService } from '../services/ticket.service';
import { CurrentUser } from '@/auth/decorators';
import { AuthenticationUser } from '@/types';
import { TicketSummarySchema } from '../dto';

@Controller('tickets')
@ApiTags('티켓')
@Roles(Role.USER, Role.ADMIN)
@ApiBearerAuth('access-token')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @ApiOperation({
    summary: '리매칭 티켓 조회',
    description: '사용자의 리매칭 티켓을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '리매칭 티켓 목록',
    type: TicketSummarySchema,
  })
  @Get('/rematching')
  async getRematchingTickets(@CurrentUser() user: AuthenticationUser) {
    return this.ticketService.getRematchingTickets(user.id);
  }
}
