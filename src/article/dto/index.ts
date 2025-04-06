import { IsBoolean, IsString, MaxLength } from "class-validator";

export class ArticleUpload {
  @IsString()
  @MaxLength(255, { message: '게시글 내용은 255자 이하입니다.' })
  content: string;

  @IsBoolean()
  anonymous: boolean;

  @IsString()
  @MaxLength(10, { message: '게시글 이모티콘은 10자 이하입니다.' })
  emoji: string;
}


export class CommentUpload {
  @IsString()
  @MaxLength(255, { message: '댓글 내용은 255자 이하입니다.' })
  content: string;

  @IsBoolean()
  anonymous: boolean;

  @IsString()
  @MaxLength(10, { message: '댓글 이모티콘은 10자 이하입니다.' })
  emoji: string;
}
