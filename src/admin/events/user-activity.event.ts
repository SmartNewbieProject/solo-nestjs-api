/**
 * 사용자 활동 이벤트
 */
export class UserActivityEvent {
  constructor(
    /**
     * 사용자 ID
     */
    public readonly userId: string,
    
    /**
     * 활동 유형
     * - login: 로그인
     * - post_article: 게시글 작성
     * - post_comment: 댓글 작성
     * - like_article: 게시글 좋아요
     * - view_article: 게시글 조회
     * - api_request: API 요청
     */
    public readonly activityType: string,
    
    /**
     * 타임스탬프
     */
    public readonly timestamp: Date = new Date(),
  ) {}
}
