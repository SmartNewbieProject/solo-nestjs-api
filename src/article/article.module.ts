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
import { ArticleViewService } from './services/article-view.service';
import { HotArticleService } from './services/hot-article.service';
import { RedisService } from '@/config/redis/redis.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ViewCountAggregator } from './services/view-count-aggregator.service';
import { UserModule } from '@/user/user.module';
import { DatabaseModule } from '@/database/database.module';
import { AnonymousNameService } from './services/anonymous-name.service';

@Module({
  imports: [ScheduleModule.forRoot(), UserModule, DatabaseModule],
  controllers: [ArticleController, CommentController, ReportController],
  providers: [
    RedisService,
    ArticleService,
    ArticleViewService,
    HotArticleService,
    ArticleRepository,
    CommentService,
    CommentRepository,
    ReportService,
    ReportRepository,
    LikeRepository,
    ViewCountAggregator,
    AnonymousNameService,
  ],
  exports: [ArticleService, AnonymousNameService]
})
export class ArticleModule { }
