import { ApiProperty } from '@nestjs/swagger';

export class VersionResponse {
  @ApiProperty({
    description: '앱 버전',
    example: '1.0.0',
  })
  version: string;

  @ApiProperty({
    description: '강제 업데이트 여부',
    example: false,
  })
  forceRedirect: boolean;
}
