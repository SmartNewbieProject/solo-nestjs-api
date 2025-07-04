import { relations } from 'drizzle-orm';
import { hotArticles } from '../hot_articles';
import { articles } from '../articles';

export const hotArticleRelations = relations(hotArticles, ({ one }) => ({
  article: one(articles, {
    fields: [hotArticles.articleId],
    references: [articles.id],
  }),
}));
