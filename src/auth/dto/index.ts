import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export { Email } from './email';
export { SignupRequest } from './signup';
export { LoginRequest } from './login';
export { TokenResponse } from './token';

export class WithdrawRequest {
  @ApiProperty({
    description: '비밀번호',
    example: '@Password123!',
  })
  @IsString({ message: '비밀번호는 문자열로 입력해주세요.' })
  password: string;
}

export class InstagramId {
  @ApiProperty({
    example: '@.somqai3',
    description: '인스타그램 ID'
  })
  @IsString()
  instagramId: string;
}
