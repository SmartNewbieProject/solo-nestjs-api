import { Module } from '@nestjs/common';
import { ArticleController } from './controllers/article.controller';
import { ArticleService } from './services/article.service';
import { ArticleRepository } from './repository/article.repository';
import { CommentController } from './controllers/comment.controller';
import { CommentService } from './services/comment.service';
import { CommentRepository } from './repository/comment.repository';
import { ReportController } from './controllers/report.controller';
import { ReportService } from './services/report.service';
import { ReportRepository } from './repository/report.repository';
import { LikeRepository } from './repository/like.repository';

@Module({
  imports: [],
  controllers: [ArticleController, CommentController, ReportController],
  providers: [
    ArticleService, 
    ArticleRepository, 
    CommentService, 
    CommentRepository,
    ReportService,
    ReportRepository,
    LikeRepository,
  ],
  exports: [ArticleService]
})
export class ArticleModule {}
