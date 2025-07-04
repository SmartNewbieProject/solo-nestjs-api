export enum ReportReason {
  PORNOGRAPHY = '음란물/성적 콘텐츠',
  VIOLENCE = '폭력적/폭력 위협 콘텐츠',
  HATE_SPEECH = '증오/혐오 발언',
  SPAM = '스팸/광고',
  PERSONAL_INFO = '개인정보 노출',
  FAKE_INFO = '가짜 정보',
  COPYRIGHT = '저작권 침해',
  OTHER = '기타 사유',
}

export const reportReasons: ReportReason[] = Object.values(ReportReason);
