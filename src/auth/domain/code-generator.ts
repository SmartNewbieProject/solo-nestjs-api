/**
 * 무작위 숫자 6자리 인증번호를 생성합니다.
 * @returns 6자리 숫자 문자열
 */
export function generateVerificationCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}
