import { Injectable } from '@nestjs/common';
import { ArticleDetails } from '../types/article.types';
import { ArticleViewService } from './article-view.service';

@Injectable()
export class ViewCountAggregator {
  constructor(private readonly articleViewService: ArticleViewService) {}

  async aggregate(article: ArticleDetails): Promise<ArticleDetails> {
    const memoryViewCount = await this.articleViewService.getViewWithoutDbCount(
      article.id,
    );
    return {
      ...article,
      readCount: article.readCount + memoryViewCount,
    };
  }

  async aggregateList(articles: ArticleDetails[]): Promise<ArticleDetails[]> {
    const articleIds = articles.map((article) => article.id);
    const memoryViewCounts = await Promise.all(
      articleIds.map((id) => this.articleViewService.getViewWithoutDbCount(id)),
    );
    return articles.map((article, index) => ({
      ...article,
      readCount: article.readCount + memoryViewCounts[index],
    }));
  }
}
