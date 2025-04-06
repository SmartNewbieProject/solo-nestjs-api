import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportRepository } from '../repository/report.repository';
import { ReportUpload } from '../dto';
import { ArticleRepository } from '../repository/article.repository';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly articleRepository: ArticleRepository,
  ) {}

  async createReport(postId: string, reporterId: string, data: ReportUpload) {
    const article = await this.articleRepository.getArticleById(postId);
    if (!article) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    const reportedId = await this.articleRepository.getArticleAuthorId(postId);
    if (!reportedId) {
      throw new NotFoundException('게시글 작성자를 찾을 수 없습니다.');
    }
    
    return await this.reportRepository.createReport(postId, reporterId, reportedId, data);
  }
}
