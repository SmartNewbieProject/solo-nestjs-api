import { articles, articleCategory, profiles, universityDetails } from '@/database/schema';
import { InferSelectModel } from 'drizzle-orm';
import { UniversityDetail } from '@/types/user';
import { Gender } from '@/types/enum';
import { ArticleModel, UniversityDetailModel, UserModel } from '@/types/database';
import { CommentDetails, CommentWithRelations } from './comment.type';

export interface ArticleWithRelations extends ArticleModel {
  author: {
    id: string;
    name: string;
    profile: {
      universityDetail: UniversityDetailModel;
      gender: Gender;
      age: number;
      user: UserModel,
    },
  };
  articleCategory: {
    code: string;
  };
  comments: CommentWithRelations[];
  likes: Array<{ id: string }>;
  commentCount: number;
}

export type AuthorDetails = {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  universityDetails: UniversityDetail;
};

export type ArticleDetails = {
  id: string;
  category: ArticleRequestType;
  content: string;
  author: AuthorDetails;
  likeCount: number;
  commentCount: number;
  readCount: number;
  comments: CommentDetails[];
  title: string;
  updatedAt: Date;
  isLiked: boolean;
};

export enum ArticleRequestType {
  GENERAL = 'general',
  REVIEW = 'review',
  LOVE_CONCERNS = 'love-concerns',
  HOT = 'hot',
}

export interface ArticleQueryOptions {
  userId?: string;
  categoryCode?: ArticleRequestType;
  page?: number;
  limit?: number;
  comment?: {
    limit?: number;
    reply?: boolean;
  };
  authorId?: string;
  searchTerm?: string;
  orderBy?: 'latest' | 'popular';
  includedBlinded?: boolean;
  includedDeleted?: boolean;
  articleId?: string;
}
