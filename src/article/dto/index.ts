import { ReportReason } from "@/types/report";
import { IsBoolean, IsString, MaxLength, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ArticleUpload {
  @ApiProperty({
    description: '게시글 내용',
    example: '게시글 내용'
  })
  @IsString()
  @MaxLength(255, { message: '게시글 내용은 255자 이하입니다.' })
  content: string;

  @ApiProperty({
    description: '게시글 이모티콘',
    example: '게시글 이모티콘'
  })
  @IsBoolean()
  anonymous: boolean;

  @ApiProperty({
    description: '게시글 이모티콘',
    example: '😊'
  })
  @IsString()
  @MaxLength(10, { message: '게시글 이모티콘은 10자 이하입니다.' })
  emoji: string;
}


export class CommentUpload {
  @ApiProperty({
    description: '댓글 내용',
    example: '댓글 내용'
  })
  @IsString()
  @MaxLength(255, { message: '댓글 내용은 255자 이하입니다.' })
  content: string;

  @ApiProperty({
    description: '댓글 이모티콘',
    example: '😊'
  })
  @IsBoolean()
  anonymous: boolean;

  @IsString()
  @MaxLength(10, { message: '댓글 이모티콘은 10자 이하입니다.' })
  emoji: string;
}


export class ReportUpload {
  @ApiProperty({
    description: '신고 사유',
    enum: ReportReason,
    example: ReportReason.PORNOGRAPHY
  })
  @IsEnum(ReportReason, { message: '신고 사유는 올바르게 선택해주세요.' })
  reason: ReportReason;
}

export class LikeArticle {
  @ApiProperty({
    description: '좋아요 여부',
    example: true
  })
  @IsBoolean()
  like: boolean;
}
