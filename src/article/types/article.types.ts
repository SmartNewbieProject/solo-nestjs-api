import { articles, users, articleCategory, comments, profiles, universityDetails } from '@/database/schema';
import { InferSelectModel } from 'drizzle-orm';

type Article = InferSelectModel<typeof articles>;
type User = InferSelectModel<typeof users>;
type Category = InferSelectModel<typeof articleCategory>;
type Comment = InferSelectModel<typeof comments>;
type Profile = InferSelectModel<typeof profiles>;
export type InferUniversityDetail = InferSelectModel<typeof universityDetails>;

export interface ArticleWithRelations extends Article {
  author: {
    id: string;
    name: string;
    profile: {
      universityDetail: InferUniversityDetail | null;
    } | null;
  };
  comments: Array<Comment & {
    author: {
      profile: {
        universityDetail: InferUniversityDetail | null;
      } | null;
    };
  }>;
  likes: Array<{ id: string }>;
}

export enum ArticleRequestType {
  GENERAL = 'general',
  REVIEW = 'review',
  LOVE_CONCERNS = 'love-concerns'
}
