import { generateVerificationCode } from '@/auth/domain/code-generator';

describe('코드 생성기 테스트', () => {
  it('6자리 숫자 인증번호를 생성해야 함', () => {
    // 인증번호 생성
    const code = generateVerificationCode();
    
    // 결과 출력
    console.log(`생성된 인증번호: ${code}`);
    
    // 검증: 문자열 타입인지 확인
    expect(typeof code).toBe('string');
    
    // 검증: 길이가 6자리인지 확인
    expect(code.length).toBe(6);
    
    // 검증: 숫자로만 구성되어 있는지 확인
    expect(code).toMatch(/^\d{6}$/);
    
    // 검증: 100000 이상 999999 이하의 숫자인지 확인
    const numericCode = parseInt(code, 10);
    expect(numericCode).toBeGreaterThanOrEqual(100000);
    expect(numericCode).toBeLessThanOrEqual(999999);
  });
  
  it('여러 번 호출해도 항상 6자리 숫자를 생성해야 함', () => {
    // 여러 번 호출하여 결과 확인
    const codes: string[] = [];
    const iterations = 10;
    
    for (let i = 0; i < iterations; i++) {
      const code = generateVerificationCode();
      codes.push(code);
      
      // 각 코드가 6자리 숫자인지 확인
      expect(code).toMatch(/^\d{6}$/);
    }
    
    console.log(`생성된 ${iterations}개의 인증번호:`, codes);
    
    // 모든 코드가 고유한지는 확인하지 않음 (랜덤이므로 중복 가능성 있음)
    // 하지만 모든 코드가 유효한 형식인지 확인
    codes.forEach(code => {
      expect(code.length).toBe(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
    });
  });
});
