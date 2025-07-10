import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AppleLoginRequest {
  @ApiProperty({
    description: '애플 아이디',
    example: 'AppleConnect',
  })
  @IsString()
  @IsNotEmpty()
  appleId: string;
}