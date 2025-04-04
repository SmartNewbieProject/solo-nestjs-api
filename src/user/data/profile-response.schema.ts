/**
 * 프로필 응답 스키마 데이터
 */

export const profileResponseExample = {
  id: '01HFGXS6YWVXDKB8RZT2VMBCHM',
  userId: '01HFGXS6YW1234567890ABCDE',
  age: 28,
  gender: 'MALE',
  name: '홍길동',
  title: '안녕하세요, 반갑습니다!',
  introduction: '취미는 독서와 여행입니다.',
  statusAt: null,
  universityDetailId: '01HFGXS6YW9876543210ZYXWV',
  preferences: [
    {
      typeName: '성격',
      selectedOptions: [
        {
          id: '01HFGXS6YW1111111111AAAAA',
          displayName: '활발함'
        },
        {
          id: '01HFGXS6YW2222222222BBBBB',
          displayName: '배려심'
        }
      ]
    },
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

export const unauthorizedResponseExample = {
  error: "Unauthorized"
};

export const notFoundResponseExample = {
  error: "사용자 프로필을 찾을 수 없습니다.",
};
