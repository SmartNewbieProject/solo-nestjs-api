import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker/locale/ko';
import { DrizzleService } from '@/database/drizzle.service';
import { generateUuidV7 } from '@/database/schema/helper';
import { Pool, PoolClient } from 'pg';
import { generateAnonymousName, generateConsistentAnonymousName } from '@/article/domain';

@Injectable()
export class ArticleSeeder {
  constructor(private readonly drizzleService: DrizzleService) { }

  async seed(
    articleCount: number = 100,
    commentCountPerArticle: number = 5,
    likeCountPerArticle: number = 10,
    batchSize: number = 20
  ) {
    const db = this.drizzleService.db;
    const pool: Pool = this.drizzleService.getPool();

    // 데이터베이스 연결 상태 확인
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      console.log('데이터베이스 연결 성공');

      // 데이터베이스 상태 확인
      const { rows: userRows } = await client.query('SELECT COUNT(*) FROM users');
      console.log(`현재 데이터베이스에 ${userRows[0].count}명의 사용자가 있습니다.`);

      const { rows: categoryRows } = await client.query('SELECT COUNT(*) FROM article_categories');
      console.log(`현재 데이터베이스에 ${categoryRows[0].count}개의 게시글 카테고리가 있습니다.`);

      client.release();
    } catch (error) {
      console.error('데이터베이스 연결 실패:', error);
      if (client) client.release();
      throw new Error('데이터베이스 연결에 실패했습니다.');
    }

    // 사용자 ID 목록 가져오기
    const { rows: users } = await pool.query('SELECT id FROM users WHERE deleted_at IS NULL');
    if (users.length === 0) {
      throw new Error('사용자가 없습니다. 먼저 사용자 데이터를 생성해주세요.');
    }

    // 카테고리 ID 목록 가져오기
    const { rows: categories } = await pool.query('SELECT id, code FROM article_categories');
    if (categories.length === 0) {
      throw new Error('게시글 카테고리가 없습니다. 먼저 카테고리 데이터를 생성해주세요.');
    }

    console.log(`${articleCount}개의 게시글 데이터 시드를 생성합니다... (배치 크기: ${batchSize})`);

    // 배치 단위로 처리
    for (let i = 0; i < articleCount; i += batchSize) {
      // 명시적 트랜잭션 시작
      client = await pool.connect();

      try {
        await client.query('BEGIN');
        console.log('트랜잭션 시작');

        const currentBatchSize = Math.min(batchSize, articleCount - i);
        const createdArticleIds = [] as string[];

        // 배치 내의 각 게시글에 대해 처리
        for (let j = 0; j < currentBatchSize; j++) {
          const articleId = generateUuidV7();
          createdArticleIds.push(articleId);

          // 랜덤 사용자 선택
          const authorId = users[Math.floor(Math.random() * users.length)].id;

          // 랜덤 카테고리 선택
          const category = categories[Math.floor(Math.random() * categories.length)];

          // 익명 여부 랜덤 결정 (30% 확률로 익명)
          const isAnonymous = Math.random() < 0.3;
          const anonymousName = isAnonymous ? generateAnonymousName() : null;

          // 게시글 데이터 삽입
          await client.query(
            'INSERT INTO articles (id, title, author_id, category_id, content, anonymous, like_count, read_count, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [
              articleId,
              faker.lorem.sentence({ min: 3, max: 8 }).substring(0, 30),
              authorId,
              category.id,
              faker.lorem.paragraph({ min: 1, max: 5 }).substring(0, 255),
              anonymousName,
              0, // 초기 좋아요 수는 0
              faker.number.int({ min: 0, max: 500 }), // 랜덤 조회수
              faker.date.recent({ days: 30 }), // 최근 30일 내 생성
              faker.date.recent({ days: 30 }), // 최근 30일 내 업데이트
            ]
          );

          // 댓글 생성
          const commentCount = Math.floor(Math.random() * commentCountPerArticle) + 1;
          for (let k = 0; k < commentCount; k++) {
            const commentId = generateUuidV7();
            const commentAuthorId = users[Math.floor(Math.random() * users.length)].id;
            const isCommentAnonymous = Math.random() < 0.5; // 50% 확률로 익명 댓글
            const commentNickname = isCommentAnonymous
              ? generateConsistentAnonymousName(commentAuthorId)
              : faker.person.fullName();

            await client.query(
              'INSERT INTO comments (id, author_id, post_id, content, nickname, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
              [
                commentId,
                commentAuthorId,
                articleId,
                faker.lorem.sentence({ min: 1, max: 3 }).substring(0, 255),
                commentNickname,
                faker.date.recent({ days: 30 }),
                faker.date.recent({ days: 30 }),
              ]
            );
          }

          // 좋아요 생성
          const likeCount = Math.floor(Math.random() * likeCountPerArticle);
          const likedUserIds = new Set();

          // 중복 없이 랜덤 사용자 선택
          while (likedUserIds.size < likeCount && likedUserIds.size < users.length) {
            const userId = users[Math.floor(Math.random() * users.length)].id;
            likedUserIds.add(userId);
          }

          // 좋아요 데이터 삽입
          for (const userId of likedUserIds) {
            const likeId = generateUuidV7();
            await client.query(
              'INSERT INTO likes (id, user_id, article_id, up, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
              [
                likeId,
                userId,
                articleId,
                true, // 좋아요 상태
                faker.date.recent({ days: 30 }),
                faker.date.recent({ days: 30 }),
              ]
            );
          }

          // 좋아요 수 업데이트
          await client.query(
            'UPDATE articles SET like_count = $1 WHERE id = $2',
            [likedUserIds.size, articleId]
          );
        }

        // 트랜잭션 커밋
        await client.query('COMMIT');

        // 진행률 표시
        const progress = Math.round(((i + currentBatchSize) / articleCount) * 100);
        if (progress % 25 === 0 || i + currentBatchSize === articleCount) {
          console.log(`진행률: ${progress}% (${i + currentBatchSize}/${articleCount} 게시글 생성 완료)`);
        }

      } catch (error) {
        // 오류 발생 시 롤백
        await client.query('ROLLBACK');
        console.error('트랜잭션 실패, 롤백 수행:', error);
        throw error;
      } finally {
        // 클라이언트 반환
        client.release();
      }
    }

    console.log(`${articleCount}개의 게시글 데이터 시드 완료`);
  }

  async clear() {
    const pool: Pool = this.drizzleService.getPool();

    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      console.log('데이터베이스 연결 성공 (데이터 삭제)');

      await client.query('BEGIN');

      // 현재 데이터베이스 상태 확인
      const { rows: articleRows } = await client.query('SELECT COUNT(*) FROM articles');
      const { rows: commentRows } = await client.query('SELECT COUNT(*) FROM comments');
      const { rows: likeRows } = await client.query('SELECT COUNT(*) FROM likes');

      console.log('현재 데이터베이스 상태:');
      console.log(`- 게시글: ${articleRows[0].count}개`);
      console.log(`- 댓글: ${commentRows[0].count}개`);
      console.log(`- 좋아요: ${likeRows[0].count}개`);

      // 테스트 데이터 삭제 (생성 역순으로 삭제)
      console.log('좋아요 데이터 삭제 중...');
      await client.query('DELETE FROM likes');

      console.log('댓글 데이터 삭제 중...');
      await client.query('DELETE FROM comments');

      console.log('게시글 데이터 삭제 중...');
      await client.query('DELETE FROM articles');

      await client.query('COMMIT');
      console.log('모든 게시글 관련 데이터가 삭제되었습니다.');
    } catch (error) {
      if (client) {
        await client.query('ROLLBACK');
      }
      console.error('데이터 삭제 중 오류 발생:', error);
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }
}
