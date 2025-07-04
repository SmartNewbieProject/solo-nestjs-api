import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export { Email } from './email';
export { SignupRequest } from './signup';
export { LoginRequest } from './login';
export { TokenResponse } from './token';
export { WithdrawRequest } from './withdraw.dto';
export { PassLoginRequest, PassLoginResponse } from './pass-login.dto';

export class InstagramId {
  @ApiProperty({
    example: '@.somqai3',
    description: '인스타그램 ID',
  })
  @IsString()
  instagramId: string;
}
