import { articles, articleCategory, profiles, universityDetails } from '@/database/schema';
import { InferSelectModel } from 'drizzle-orm';
import { UniversityDetail } from '@/types/user';
import { Gender } from '@/types/enum';
import { ArticleModel, UniversityDetailModel, UserModel } from '@/types/database';
import { CommentWithRelations } from './comment.type';

export interface ArticleWithRelations extends ArticleModel {
  author: {
    id: string;
    name: string;
    profile: {
      universityDetail: UniversityDetailModel | null;
      gender: Gender;
      user: UserModel,
    },
  };
  articleCategory: {
    code: string;
  };
  comments: CommentWithRelations[];
  likes: Array<{ id: string }>;
}

export type AuthorDetails = {
  id: string;
  name: string;
  gender: Gender;
  universityDetails: UniversityDetail;
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
