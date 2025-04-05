/**
 * 선호도 관련 스키마 데이터
 */

// 선호도 타입별 예시 데이터
export const preferenceTypeExamples = {
  // 성격 유형
  personality: {
    typeName: '성격',
    options: [
      { id: '1', displayName: '활발함' },
      { id: '2', displayName: '조용함' },
      { id: '3', displayName: '배려심' },
      { id: '4', displayName: '솔직함' },
      { id: '5', displayName: '유머러스' }
    ]
  },
  
  // 연애 스타일
  datingStyle: {
    typeName: '연애 스타일',
    options: [
      { id: '1', displayName: '적극적' },
      { id: '2', displayName: '다정다감' },
      { id: '3', displayName: '츤데레' },
      { id: '4', displayName: '로맨틱' }
    ]
  },
  
  // 라이프스타일
  lifestyle: {
    typeName: '라이프스타일',
    options: [
      { id: '1', displayName: '아침형' },
      { id: '2', displayName: '밤형' },
      { id: '3', displayName: '집순이/집돌이' },
      { id: '4', displayName: '외향적' }
    ]
  },
  
  // 음주 선호도
  drinking: {
    typeName: '음주',
    options: [
      { id: '1', displayName: '안 마심' },
      { id: '2', displayName: '가끔 마심' },
      { id: '3', displayName: '자주 마심' }
    ]
  },
  
  // 흡연 선호도
  smoking: {
    typeName: '흡연',
    options: [
      { id: '1', displayName: '비흡연' },
      { id: '2', displayName: '가끔 흡연' },
      { id: '3', displayName: '매일 흡연' }
    ]
  },
  
  // MBTI 유형
  mbti: {
    typeName: 'MBTI',
    options: [
      { id: '1', displayName: 'ISTJ' },
      { id: '2', displayName: 'ISFJ' },
      { id: '3', displayName: 'INFJ' },
      { id: '4', displayName: 'INTJ' },
      { id: '5', displayName: 'ISTP' },
      { id: '6', displayName: 'ISFP' },
      { id: '7', displayName: 'INFP' },
      { id: '8', displayName: 'INTP' },
      { id: '9', displayName: 'ESTP' },
      { id: '10', displayName: 'ESFP' },
      { id: '11', displayName: 'ENFP' },
      { id: '12', displayName: 'ENTP' },
      { id: '13', displayName: 'ESTJ' },
      { id: '14', displayName: 'ESFJ' },
      { id: '15', displayName: 'ENFJ' },
      { id: '16', displayName: 'ENTJ' }
    ]
  }
};

// 선호도 목록 응답 예시 데이터
export const preferenceListResponseExample = [
  {
    typeName: '성격',
    options: [
      { id: '01HFGXS6YW1111111111AAAAA', displayName: '활발함' },
      { id: '01HFGXS6YW2222222222BBBBB', displayName: '조용함' },
      { id: '01HFGXS6YW3333333333CCCCC', displayName: '배려심' },
      { id: '01HFGXS6YW4444444444DDDDD', displayName: '솔직함' },
      { id: '01HFGXS6YW5555555555EEEEE', displayName: '유머러스' }
    ],
    multiple: true,
    maximumChoiceCount: 3
  },
  {
    typeName: '연애 스타일',
    options: [
      { id: '01HFGXS6YW6666666666FFFFF', displayName: '적극적' },
      { id: '01HFGXS6YW7777777777GGGGG', displayName: '다정다감' },
      { id: '01HFGXS6YW8888888888HHHHH', displayName: '츤데레' },
      { id: '01HFGXS6YW9999999999IIIII', displayName: '로맨틱' }
    ],
    multiple: true,
    maximumChoiceCount: 2
  },
  {
    typeName: 'MBTI',
    options: [
      { id: '01HFGXS6YWAAAAAAAAAJJJJJ', displayName: 'ISTJ' },
      { id: '01HFGXS6YWBBBBBBBBBKKKKK', displayName: 'ISFJ' },
      { id: '01HFGXS6YWCCCCCCCCCLLLL', displayName: 'INFJ' },
      { id: '01HFGXS6YWDDDDDDDDDMMMMM', displayName: 'INTJ' }
    ],
    multiple: false,
    maximumChoiceCount: 1
  }
];

// 선호도 저장 요청 예시 데이터
export const preferenceSaveExample = {
  data: [
    {
      preferenceTypeId: '01HFGXS6YW1234567890ABCDE',
      preferenceOptionIds: ['01HFGXS6YW1111111111AAAAA', '01HFGXS6YW2222222222BBBBB']
    },
    {
      preferenceTypeId: '01HFGXS6YW5678901234FGHIJ',
      preferenceOptionIds: ['01HFGXS6YW3333333333CCCCC']
    }
  ]
};

// 선호도 저장 응답 예시 데이터
export const preferenceSaveResponseExample = {
  success: true,
  message: '선호도가 성공적으로 저장되었습니다.'
};
