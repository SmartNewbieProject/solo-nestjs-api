import { Injectable, NotFoundException } from '@nestjs/common';
import { articles } from '@/database/schema';
import { ArticleUpload } from '../dto';
import { sql, eq, and, isNull, desc } from 'drizzle-orm';
import { generateUuidV7 } from '@/database/schema/helper';
import * as schema from '@database/schema';
import { ArticleWithRelations } from '../types/article.types';

import { InjectDrizzle } from '@/common/decorators';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { generateAnonymousName } from '../domain';

@Injectable()
export class ArticleRepository {
  constructor(@InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
  ) { }

  getArticleCategories() {
    return this.db.query.articleCategory.findMany({
      columns: {
        displayName: true,
        emojiUrl: true,
        code: true,
      },
    });
  }

  async createArticle(authorId: string, articleData: ArticleUpload) {
    const category = await this.db.query.articleCategory.findFirst({
      where: eq(schema.articleCategory.code, articleData.type),
    });

    if (!category) {
      throw new NotFoundException('존재하지 않는 카테고리입니다.');
    }

    const result = await this.db.insert(articles).values({
      id: generateUuidV7(),
      authorId,
      categoryId: category.id,
      content: articleData.content,
      anonymous: articleData.anonymous ? generateAnonymousName() : null,
      likeCount: 0,
      readCount: 0,
      blindedAt: null,
    }).returning();

    return result[0];
  }

  async getArticles(
    categoryId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<ArticleWithRelations[]> {
    const results = await this.db.query.articles.findMany({
      with: {
        author: {
          columns: {
            id: true,
            name: true,
          },
          with: {
            profile: {
              with: {
                universityDetail: true,
                user: true,
              },
            }
          },
        },
        articleCategory: {
          columns: {
            code: true,
          },
        },
        comments: {
          limit: 3,
          with: {
            author: {
              with: {
                profile: {
                  with: {
                    universityDetail: true,
                    user: true,
                  },
                },
              }
            }
          },
          where: ({ deletedAt }) => isNull(deletedAt),
        },
        likes: {
          columns: {
            id: true,
          },
          where: ({ up }) => eq(up, true)
        },
      },
      where: ({ deletedAt, categoryId: queryCategoryId }) =>
        and(
          eq(queryCategoryId, categoryId),
          isNull(deletedAt)
        ),
      limit,
      offset,
      orderBy: desc(articles.createdAt),
    });

    return results as ArticleWithRelations[];
  }

  async getArticleById(id: string): Promise<ArticleWithRelations | null> {
    const result = await this.db.query.articles.findFirst({
      where: sql`${articles.id} = ${id} AND ${articles.deletedAt} IS NULL`,
      with: {
        author: {
          columns: {
            id: true,
            name: true,
          },
          with: {
            profile: {
              with: {
                universityDetail: true,
                user: true,
              },
            }
          },
        },
        articleCategory: {
          columns: {
            code: true,
          },
        },
        comments: {
          limit: 3,
          with: {
            author: {
              with: {
                profile: {
                  with: {
                    universityDetail: true,
                    user: true,
                  },
                },
              }
            }
          },
          where: ({ deletedAt }) => isNull(deletedAt),
        },
        likes: {
          columns: {
            id: true,
          },
          where: ({ up }) => eq(up, true)
        },
      },
    });

    return result as ArticleWithRelations | null;
  }

  async deleteArticle(id: string) {
    const now = new Date();
    const result = await this.db.update(articles)
      .set({ deletedAt: now })
      .where(and(eq(articles.id, id), isNull(articles.deletedAt)))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async getArticleAuthorId(id: string) {
    const result = await this.db.select({ authorId: articles.authorId })
      .from(articles)
      .where(and(
        eq(articles.id, id),
        isNull(articles.deletedAt)
      ));

    return result.length > 0 ? result[0].authorId : null;
  }

  async updateArticle(id: string, data: Partial<ArticleUpload>) {
    const result = await this.db.update(articles)
      .set({
        content: data.content,
        updatedAt: new Date(),
      })
      .where(and(
        eq(articles.id, id),
        isNull(articles.deletedAt)
      ))
      .returning();

    return result.length > 0 ? result[0] : null;
  }
}
