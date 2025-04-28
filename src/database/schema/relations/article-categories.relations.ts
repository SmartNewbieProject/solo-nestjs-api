import { relations } from 'drizzle-orm';
import { articleCategory } from '../article_categories';
import { articles } from '../articles';

export const articleCategoryRelations = relations(articleCategory, ({ many }) => ({
  articles: many(articles),
}));
