import { Logger } from "@nestjs/common";

export class HotArticleCalculator {
  private static logger = new Logger(HotArticleCalculator.name);
  private static readonly WEIGHTS = {
    VIEW: 1,      // 조회수 1회당 1점
    LIKE: 10,     // 좋아요 1회당 10점
    COMMENT: 15,  // 댓글 1회당 15점
  };

  // 인기 게시글 기준점수 (1.0 이상이면 인기)
  // private static readonly THRESHOLD = 300;
  // 좋아요 5개, 조회수 30회, 댓글 2개 이상 기준으로..
  private static readonly THRESHOLD = 110;

  static calculateScore(views: number, likes: number, comments: number): number {
    const totalScore =
      (views * this.WEIGHTS.VIEW) +
      (likes * this.WEIGHTS.LIKE) +
      (comments * this.WEIGHTS.COMMENT);
    this.logger.debug(`게시글 점수 계산 완료: ${totalScore} \\ ${JSON.stringify({ views, likes, comments }, null, 2)}`);
    return totalScore / this.THRESHOLD;
  }

  static isHot(score: number): boolean {
    return score >= 1.0;
  }
}
