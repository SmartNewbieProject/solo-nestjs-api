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
    description: '익명 처리 여부',
    example: true
  })
  @IsBoolean({ message: '익명 처리 여부는 불리언 값이어야 합니다.' })
  anonymous: boolean;

  @ApiProperty({
    description: '게시글 제목',
    example: '아무나 친해지실분 계신가요??',
  })
  @IsString()
  @MaxLength(30, { message: '게시글 제목은 30자 이하입니다.' })
  title: string;
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
    description: '익명 처리 여부',
    example: true
  })
  @IsBoolean({ message: '익명 처리 여부는 불리언 값이어야 합니다.' })
  anonymous: boolean;
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
