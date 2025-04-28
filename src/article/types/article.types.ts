import { articles, users, articleCategory, comments, profiles, universityDetails } from '@/database/schema';
import { InferSelectModel } from 'drizzle-orm';
import { UniversityDetail } from '@/types/user';
import { Gender } from '@/types/enum';

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

export type AuthorDetails = {
  id: string;
  name: string;
  gender: Gender;
  universityDetails: UniversityDetail;
};

export type CommentDetails = {
  id: string;
  content: string;
  author: AuthorDetails;
  updatedAt: Date;
};

export type ArticleDetails = {
  id: string;
  category: ArticleRequestType;
  content: string;
  author: AuthorDetails;
  updatedAt: Date;
  isLiked: boolean;
};

export enum ArticleRequestType {
  GENERAL = 'general',
  REVIEW = 'review',
  LOVE_CONCERNS = 'love-concerns'
}
