import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/auth/decorators';
import { Role } from '@/auth/domain/user-role.enum';
import { Email } from '@/auth/dto';
import { PreSignUp } from '../dto/email.dto';
import { SignupRequest } from '@/auth/dto';
import { SignupService } from '@/auth/services/signup.service';

@ApiTags('어드민')
@Controller('admin/mail')
@Roles(Role.ADMIN)
@ApiBearerAuth('access-token')
export class AdminMailController {
  constructor(private readonly signService: SignupService) {
  }

  @ApiOperation({ summary: '어드민 - 사전가입 인증 메일 전송' })
  @Post('/pre-signup')
  async sendPreSignupEmail(@Body() { email, name }: PreSignUp) {
    // TODO: Pass 기반 회원가입으로 변경되어 사전가입 메일 기능 비활성화
    // this.signService.sendPreWelcomeEmail(email, name, {} as SignupRequest);
  }

}
