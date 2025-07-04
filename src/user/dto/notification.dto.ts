import { ApiProperty } from '@nestjs/swagger';

export class Notification {
  @ApiProperty({
    example: '공지사항',
    description: '공지사항 제목',
  })
  announcement: string;
  title: string;
  content: string;
  redirectUrl?: string;
  okMessage: string;
}
