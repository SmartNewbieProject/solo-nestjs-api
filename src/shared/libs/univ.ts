/**
 * 대학교 로고 관련 유틸리티
 * 프론트엔드와 백엔드에서 공통으로 사용
 */

// 대학교 이름 enum (프론트엔드와 동일)
export enum UniversityName {
  공주대학교 = '공주대학교',
  공주교육대학교 = '공주교육대학교',
  충북대학교 = '충북대학교',
  청주교육대학교 = '청주교육대학교',
  배재대학교 = '배재대학교',
  충남대학교 = '충남대학교',
  대전보건대학교 = '대전보건대학교',
  대전대학교 = '대전대학교',
  한밭대학교 = '한밭대학교',
  한남대학교 = '한남대학교',
  건양대학교 = '건양대학교',
  목원대학교 = '목원대학교',
  우송대학교 = '우송대학교',
  을지대학교 = '을지대학교',
  고려대학교세종캠퍼스 = '고려대학교 세종캠퍼스',
  홍익대학교세종캠퍼스 = '홍익대학교 세종캠퍼스',
  한국교원대학교 = '한국교원대학교',
  KAIST = 'KAIST',
}

// 대학교별 로고 파일명 매핑
export const UniversityImage: { [key in UniversityName]?: string } = {
  [UniversityName.공주대학교]: "kgu.png",
  [UniversityName.공주교육대학교]: "keu.png",
  [UniversityName.충북대학교]: "cbu.png",
  [UniversityName.청주교육대학교]: "ceu.png",
  [UniversityName.배재대학교]: "bju.png",
  [UniversityName.충남대학교]: "cnu.png",
  [UniversityName.대전보건대학교]: "dbu.png",
  [UniversityName.대전대학교]: "ddu.png",
  [UniversityName.한밭대학교]: "hbu.png",
  [UniversityName.한남대학교]: "hnu.png",
  [UniversityName.건양대학교]: "kyu.png",
  [UniversityName.목원대학교]: "mwu.png",
  [UniversityName.우송대학교]: "wsu.png",
  [UniversityName.을지대학교]: "uju.png", // 실제 파일명에 맞게 수정
  [UniversityName.고려대학교세종캠퍼스]: "kau.png",
  [UniversityName.홍익대학교세종캠퍼스]: "hiu.png",
  [UniversityName.한국교원대학교]: "knu.png",
  // KAIST는 로고 파일이 없음
};

const baseUrl = 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/univ/';

/**
 * 대학교 이름으로 로고 URL 생성
 */
const createImageUrl = (univ: UniversityName) => {
  const filename = UniversityImage[univ];
  return filename ? `${baseUrl}${filename}` : null;
};

/**
 * 대학교 로고 URL 가져오기 (프론트엔드와 동일한 함수명)
 */
export const getUnivLogo = (univ: UniversityName): string | null => {
  return createImageUrl(univ);
};

/**
 * 문자열 대학교 이름을 UniversityName enum으로 변환
 */
export const getUniversityNameEnum = (universityString: string): UniversityName | null => {
  // 정확한 매칭 시도
  const exactMatch = Object.values(UniversityName).find(name => name === universityString);
  if (exactMatch) {
    return exactMatch as UniversityName;
  }

  // 부분 매칭 시도 (공백 제거 등)
  const normalizedInput = universityString.replace(/\s+/g, '');
  const partialMatch = Object.values(UniversityName).find(name => 
    name.replace(/\s+/g, '') === normalizedInput
  );
  
  return partialMatch as UniversityName || null;
};

/**
 * 문자열 대학교 이름으로 직접 로고 URL 가져오기
 */
export const getUnivLogoByString = (universityString: string): string | null => {
  const universityEnum = getUniversityNameEnum(universityString);
  return universityEnum ? getUnivLogo(universityEnum) : null;
};

/**
 * 모든 대학교 로고 매핑 정보 반환 (디버깅용)
 */
export const getAllUniversityLogos = (): { [key: string]: string | null } => {
  const result: { [key: string]: string | null } = {};
  
  Object.values(UniversityName).forEach(univ => {
    result[univ] = getUnivLogo(univ);
  });
  
  return result;
};
