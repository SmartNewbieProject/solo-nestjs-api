/**
 * 프로필 응답 스키마 데이터
 */

/**
 * 프로필 이미지 응답 예시
 */
export const profileImageExample = {
  id: '01HFGXS6YWVXDKB8RZT2VMBCHM',
  order: 1,
  isMain: true,
  url: 'https://example.com/images/profile.jpg'
};

/**
 * 대학 정보 응답 예시
 */
export const universityDetailExample = {
  name: '한밭대학교',
  authentication: true,
  department: '컴퓨터공학과'
};

/**
 * 선호도 옵션 응답 예시
 */
export const preferenceOptionExample = {
  id: '01HFGXS6YW1111111111AAAAA',
  displayName: '활발함'
};

/**
 * 선호도 타입 그룹 응답 예시
 */
export const preferenceTypeGroupExample = {
  typeName: '성격',
  selectedOptions: [
    preferenceOptionExample,
    {
      id: '01HFGXS6YW2222222222BBBBB',
      displayName: '배려심'
    }
  ]
};

/**
 * 프로필 응답 예시
 */
export const profileResponseExample = {
  name: '홍길동',
  age: 28,
  gender: 'MALE',
  profileImages: [
    profileImageExample,
    {
      id: '01HFGXS6YW9876543210ZYXWV',
      order: 2,
      isMain: false,
      url: 'https://example.com/images/profile2.jpg'
    }
  ],
  universityDetails: universityDetailExample,
  preferences: [
    preferenceTypeGroupExample,
    {
      typeName: '연애 스타일',
      selectedOptions: [
        {
          id: '01HFGXS6YW3333333333CCCCC',
          displayName: '다정다감'
        }
      ]
    }
  ]
};

/**
 * 인증 실패 응답 예시
 */
export const unauthorizedResponseExample = {
  error: "Unauthorized"
};

/**
 * 프로필 찾을 수 없음 응답 예시
 */
export const notFoundResponseExample = {
  error: "사용자 프로필을 찾을 수 없습니다."
};
