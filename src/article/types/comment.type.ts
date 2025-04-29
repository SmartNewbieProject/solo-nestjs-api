import { InferSelectModel } from 'drizzle-orm';
import { comments } from '@/database/schema';
import { AuthorDetails } from './article.types';
import { Gender } from '@/types/enum';
import { UniversityDetailModel, UserModel } from '@/types/database';

export type InferComment = InferSelectModel<typeof comments>;

export interface CommentWithRelations extends InferComment {
  author: {
    id: string;
    name: string;
    profile: {
      gender: Gender;
      age: number;
      user: UserModel;
      universityDetail: UniversityDetailModel;
    },
  };
}

export interface CommentDetails {
  id: string;
  content: string;
  author: AuthorDetails;
  updatedAt: Date;
};
