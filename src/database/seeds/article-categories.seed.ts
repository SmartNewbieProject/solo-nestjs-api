import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle.service';
import { articleCategory } from '../schema/article_categories';
import { ArticleRequestType } from '@/article/types/article.types';

@Injectable()
export class ArticleCategorySeeder {
  constructor(private readonly drizzleService: DrizzleService) {}

  async seed() {
    const categories = [
      {
        code: ArticleRequestType.GENERAL,
        emojiUrl:
          'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/realtime.png',
        displayName: '실시간',
      },
      {
        code: ArticleRequestType.REVIEW,
        emojiUrl:
          'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/review.png',
        displayName: '리뷰',
      },
      {
        code: ArticleRequestType.LOVE_CONCERNS,
        emojiUrl:
          'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/resources/love-letter.png',
        displayName: '연애상담',
      },
    ];

    await this.drizzleService.db.insert(articleCategory).values(
      categories.map((category) => ({
        id: crypto.randomUUID(),
        ...category,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );
  }
}
