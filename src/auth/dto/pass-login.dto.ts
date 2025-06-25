import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class PassLoginRequest {
  @ApiProperty({
    description: '아임포트 본인인증 고유번호',
    example: 'imp_123456789',
  })
  @IsString()
  @IsNotEmpty()
  impUid: string;
}

export class PassLoginResponse {
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
    description: '토큰 만료 시간 (초)',
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: '사용자 역할',
    example: 'user',
  })
  role: string;

  @ApiProperty({
    description: '신규 사용자 여부',
    example: false,
  })
  isNewUser: boolean;

  @ApiProperty({
    description: '본인인증 정보 (신규 사용자인 경우)',
    required: false,
  })
  certificationInfo?: {
    name: string;
    phone: string;
    gender: string;
    birthday: string;
  };
}
