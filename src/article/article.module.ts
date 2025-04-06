import { Module } from '@nestjs/common';
import { ArticleController } from './controllers/article.controller';
import { ArticleService } from './services/article.service';
import { ArticleRepository } from './repository/article.repository';
import { CommentController } from './controllers/comment.controller';
import { CommentService } from './services/comment.service';
import { CommentRepository } from './repository/comment.repository';

@Module({
  imports: [],
  controllers: [ArticleController, CommentController],
  providers: [
    ArticleService, 
    ArticleRepository, 
    CommentService, 
    CommentRepository,
  ],
  exports: [ArticleService]
})
export class ArticleModule {}
