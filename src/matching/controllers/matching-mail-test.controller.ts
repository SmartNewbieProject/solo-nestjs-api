import { Controller, Post, Body } from '@nestjs/common';
import { MatchingEmailService } from '../services/mail.service';
import { IsEmail, IsString } from 'class-validator';
import { Public } from '@/auth/decorators';
import { ApiOperation } from '@nestjs/swagger';

class RequestBody {
  @IsEmail()
  email: string;

  @IsString()
  name: string;
}

@Public()
@Controller('matching-mail-test')
export class MatchingMailTestController {
  constructor(private readonly matchingEmailService: MatchingEmailService) {}

  @Post('alert')
  async sendTestAlert(@Body() body: RequestBody) {
    return this.matchingEmailService.sendMatchingAlertEmail(
      body.email,
      body.name,
    );
  }
}
