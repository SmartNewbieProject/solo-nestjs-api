import { Body, Controller, Post } from '@nestjs/common';
import { SignupService } from '../services/signup.service';
import { Email, SignupRequest } from '../dto';
import { Public } from '@auth/decorators';
import { SignupDocs } from '../docs/signup.docs';

@Controller('auth')
@SignupDocs.controller()
@Public()
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post('signup')
  @SignupDocs.signup()
  async signup(@Body() signupRequest: SignupRequest) {
    return await this.signupService.signup(signupRequest);
  }

  @Post('check/email')
  @SignupDocs.checkEmail()
  async checkEmail(@Body() { email }: Email) {
    const exists = await this.signupService.checkEmail(email);
    return { exists };
  }
}
