import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class TokenResponse {
  @ApiProperty({
    description: '액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: '리프레시 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: '토큰 타입',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: '액세스 토큰 만료 시간 (초)',
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: '권한',
    example: 'user',
  })
  role: 'user' | 'admin';
}

export class RefreshToken {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}