/**
 * 탈퇴 사유 열거형
 */
export enum WithdrawalReason {
  FOUND_PARTNER = 'FOUND_PARTNER', // 파트너를 찾아서
  POOR_MATCHING = 'POOR_MATCHING', // 매칭 품질이 좋지 않아서
  PRIVACY_CONCERN = 'PRIVACY_CONCERN', // 개인정보 보호 우려
  SAFETY_CONCERN = 'SAFETY_CONCERN', // 안전 우려
  TECHNICAL_ISSUES = 'TECHNICAL_ISSUES', // 기술적 문제
  INACTIVE_USAGE = 'INACTIVE_USAGE', // 서비스를 잘 사용하지 않아서
  DISSATISFIED_SERVICE = 'DISSATISFIED_SERVICE', // 서비스에 불만족
  OTHER = 'OTHER', // 기타 사유
}

/**
 * 탈퇴 사유 표시 이름
 */
export const withdrawalReasonDisplayNames: Record<WithdrawalReason, string> = {
  [WithdrawalReason.FOUND_PARTNER]: '파트너를 찾아서',
  [WithdrawalReason.POOR_MATCHING]: '매칭 품질이 좋지 않아서',
  [WithdrawalReason.PRIVACY_CONCERN]: '개인정보 보호 우려',
  [WithdrawalReason.SAFETY_CONCERN]: '안전 우려',
  [WithdrawalReason.TECHNICAL_ISSUES]: '기술적 문제',
  [WithdrawalReason.INACTIVE_USAGE]: '서비스를 잘 사용하지 않아서',
  [WithdrawalReason.DISSATISFIED_SERVICE]: '서비스에 불만족',
  [WithdrawalReason.OTHER]: '기타 사유',
};
