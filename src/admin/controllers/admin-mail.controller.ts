import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '@/auth/decorators';
import { Role } from '@/auth/domain/user-role.enum';
import { Email } from '@/auth/dto';
import { PreSignUp } from '../dto/email.dto';
import { SignupRequest } from '@/auth/dto';
import { SignupService } from '@/auth/services/signup.service';

@ApiTags('어드민')
@Controller('admin/mail')
@Roles(Role.ADMIN)
export class AdminMailController {
  constructor(private readonly signService: SignupService) {

  }

  @Post('/pre-signup')
  async sendPreSignupEmail(@Body() { email, name }: PreSignUp) {    
    this.signService.sendPreWelcomeEmail(email, name, {} as SignupRequest);
  }

}
