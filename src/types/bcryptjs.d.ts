declare module 'bcryptjs' {
  /**
   * 비밀번호를 해시화합니다.
   * @param s 해시화할 문자열
   * @param salt 솔트 라운드 또는 솔트
   * @param callback 콜백 함수
   */
  export function hash(s: string, salt: string | number): Promise<string>;
  export function hash(
    s: string,
    salt: string | number,
    callback: (err: Error, hash: string) => void,
  ): void;

  /**
   * 비밀번호를 비교합니다.
   * @param s 비교할 문자열
   * @param hash 비교할 해시
   * @param callback 콜백 함수
   */
  export function compare(s: string, hash: string): Promise<boolean>;
  export function compare(
    s: string,
    hash: string,
    callback: (err: Error, same: boolean) => void,
  ): void;

  /**
   * 솔트를 생성합니다.
   * @param rounds 라운드 수
   * @param callback 콜백 함수
   */
  export function genSalt(rounds?: number): Promise<string>;
  export function genSalt(
    rounds: number,
    callback: (err: Error, salt: string) => void,
  ): void;

  /**
   * 동기적으로 비밀번호를 해시화합니다.
   * @param s 해시화할 문자열
   * @param salt 솔트 라운드 또는 솔트
   */
  export function hashSync(s: string, salt: string | number): string;

  /**
   * 동기적으로 비밀번호를 비교합니다.
   * @param s 비교할 문자열
   * @param hash 비교할 해시
   */
  export function compareSync(s: string, hash: string): boolean;

  /**
   * 동기적으로 솔트를 생성합니다.
   * @param rounds 라운드 수
   */
  export function genSaltSync(rounds?: number): string;
}
