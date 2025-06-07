import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from '@/article/services/article.service';
import { CommentService } from '@/article/services/comment.service';
import { ArticleRepository } from '@/article/repository/article.repository';
import { CommentRepository } from '@/article/repository/comment.repository';
import { LikeRepository } from '@/article/repository/like.repository';
import { ArticleViewService } from '@/article/services/article-view.service';
import { ViewCountAggregator } from '@/article/services/view-count-aggregator.service';
import { AnonymousNameService } from '@/article/services/anonymous-name.service';
import ProfileRepository from '@/user/repository/profile.repository';
import { BadRequestException } from '@nestjs/common';
import { Gender, Role } from '@/types/enum';
import { ArticleRequestType } from '@/article/types/article.types';

// Mock dependencies
const mockArticleRepository = {
  getRecentArticleByUser: jest.fn(),
  createArticle: jest.fn(),
  getArticleById: jest.fn(),
};

const mockCommentRepository = {
  getRecentCommentByUser: jest.fn(),
  createComment: jest.fn(),
};

const mockProfileRepository = {
  getProfileSummary: jest.fn(),
};

const mockAnonymousNameService = {
  generateAnonymousName: jest.fn(),
};

const mockLikeRepository = {};
const mockArticleViewService = {};
const mockViewCountAggregator = {};

describe('중복 요청 방지 테스트', () => {
  let articleService: ArticleService;
  let commentService: CommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        CommentService,
        { provide: ArticleRepository, useValue: mockArticleRepository },
        { provide: CommentRepository, useValue: mockCommentRepository },
        { provide: ProfileRepository, useValue: mockProfileRepository },
        { provide: AnonymousNameService, useValue: mockAnonymousNameService },
        { provide: LikeRepository, useValue: mockLikeRepository },
        { provide: ArticleViewService, useValue: mockArticleViewService },
        { provide: ViewCountAggregator, useValue: mockViewCountAggregator },
      ],
    }).compile();

    articleService = module.get<ArticleService>(ArticleService);
    commentService = module.get<CommentService>(CommentService);
    
    jest.clearAllMocks();
  });

  describe('게시글 중복 방지', () => {
    test('10초 이내 동일한 게시글 작성 시 에러 발생', async () => {
      const user = { id: 'user1', name: 'Test User', role: Role.USER, email: 'test@test.com', gender: Gender.MALE };
      const articleData = { title: '테스트 제목', content: '테스트 내용', type: ArticleRequestType.GENERAL, anonymous: false };

      // 최근 게시글이 동일한 내용으로 존재
      mockArticleRepository.getRecentArticleByUser.mockResolvedValue({
        title: '테스트 제목',
        content: '테스트 내용',
        createdAt: new Date(),
      });

      await expect(articleService.createArticle(user, articleData))
        .rejects
        .toThrow(BadRequestException);
    });

    test('10초 이내 다른 내용의 게시글 작성 시 정상 처리', async () => {
      const user = { id: 'user1', name: 'Test User', role: Role.USER, email: 'test@test.com', gender: Gender.MALE };
      const articleData = { title: '새로운 제목', content: '새로운 내용', type: ArticleRequestType.GENERAL, anonymous: false };

      // 최근 게시글이 다른 내용
      mockArticleRepository.getRecentArticleByUser.mockResolvedValue({
        title: '이전 제목',
        content: '이전 내용',
        createdAt: new Date(),
      });

      mockAnonymousNameService.generateAnonymousName.mockResolvedValue(null);
      mockArticleRepository.createArticle.mockResolvedValue({ id: 'article1' });

      await expect(articleService.createArticle(user, articleData))
        .resolves
        .not.toThrow();
    });
  });

  describe('댓글 중복 방지', () => {
    test('5초 이내 동일한 댓글 작성 시 에러 발생', async () => {
      const user = { id: 'user1', name: 'Test User', role: Role.USER, email: 'test@test.com', gender: Gender.MALE };
      const commentData = { content: '테스트 댓글', anonymous: false };

      mockArticleRepository.getArticleById.mockResolvedValue({ id: 'article1' });
      mockCommentRepository.getRecentCommentByUser.mockResolvedValue({
        content: '테스트 댓글',
        createdAt: new Date(),
      });

      await expect(commentService.createComment('article1', user, commentData))
        .rejects
        .toThrow(BadRequestException);
    });

    test('5초 이내 다른 내용의 댓글 작성 시 정상 처리', async () => {
      const user = { id: 'user1', name: 'Test User', role: Role.USER, email: 'test@test.com', gender: Gender.MALE };
      const commentData = { content: '새로운 댓글', anonymous: false };

      mockArticleRepository.getArticleById.mockResolvedValue({ id: 'article1' });
      mockCommentRepository.getRecentCommentByUser.mockResolvedValue({
        content: '이전 댓글',
        createdAt: new Date(),
      });

      mockProfileRepository.getProfileSummary.mockResolvedValue({ name: 'Test User' });
      mockAnonymousNameService.generateAnonymousName.mockResolvedValue(null);
      mockCommentRepository.createComment.mockResolvedValue({ id: 'comment1' });

      await expect(commentService.createComment('article1', user, commentData))
        .resolves
        .not.toThrow();
    });
  });
});
