/**
 * 익명 사용자 이름 생성기
 * 수식어와 동물 이름을 조합하여 익명 사용자 이름을 생성합니다.
 */

// 수식어 목록 (100개)
const adjectives = [
  '귀여운',
  '용감한',
  '지혜로운',
  '장난스러운',
  '우아한',
  '활발한',
  '느긋한',
  '재빠른',
  '온순한',
  '영리한',
  '신비로운',
  '행복한',
  '따뜻한',
  '차분한',
  '친절한',
  '부지런한',
  '당당한',
  '명랑한',
  '조용한',
  '씩씩한',
  '엉뚱한',
  '다정한',
  '깜찍한',
  '순수한',
  '사랑스러운',
  '재치있는',
  '멋진',
  '화려한',
  '단단한',
  '푸른',
  '작은',
  '큰',
  '긴',
  '짧은',
  '둥근',
  '네모난',
  '날렵한',
  '통통한',
  '날씬한',
  '힘센',
  '빠른',
  '느린',
  '높은',
  '낮은',
  '밝은',
  '어두운',
  '반짝이는',
  '매끄러운',
  '거친',
  '부드러운',
  '뾰족한',
  '무딘',
  '가벼운',
  '무거운',
  '젊은',
  '늙은',
  '새로운',
  '오래된',
  '달콤한',
  '쓴',
  '시원한',
  '따뜻한',
  '뜨거운',
  '차가운',
  '건조한',
  '축축한',
  '깨끗한',
  '지저분한',
  '향기로운',
  '고요한',
  '시끄러운',
  '조용한',
  '활기찬',
  '나른한',
  '졸린',
  '생기있는',
  '피곤한',
  '행복한',
  '슬픈',
  '화난',
  '놀란',
  '기쁜',
  '만족한',
  '불만족한',
  '궁금한',
  '호기심많은',
  '겁많은',
  '용감한',
  '소심한',
  '대담한',
  '예민한',
  '둔감한',
  '꼼꼼한',
  '대충하는',
  '진지한',
  '유머러스한',
  '엄격한',
  '관대한',
  '인내심있는',
  '급한',
];

// 동물 이름 목록 (100개)
const animals = [
  '고양이',
  '강아지',
  '토끼',
  '사자',
  '호랑이',
  '코끼리',
  '기린',
  '원숭이',
  '팬더',
  '곰',
  '여우',
  '늑대',
  '사슴',
  '다람쥐',
  '하마',
  '코알라',
  '캥거루',
  '고릴라',
  '치타',
  '표범',
  '재규어',
  '하이에나',
  '미어캣',
  '수달',
  '비버',
  '족제비',
  '스컹크',
  '너구리',
  '오소리',
  '두더지',
  '고슴도치',
  '쥐',
  '햄스터',
  '기니피그',
  '페럿',
  '청설모',
  '얼룩말',
  '하이에나',
  '코뿔소',
  '하마',
  '악어',
  '거북이',
  '뱀',
  '도마뱀',
  '이구아나',
  '카멜레온',
  '개구리',
  '두꺼비',
  '도롱뇽',
  '살라만더',
  '독수리',
  '매',
  '올빼미',
  '까마귀',
  '까치',
  '참새',
  '제비',
  '기러기',
  '오리',
  '백조',
  '펭귄',
  '타조',
  '앵무새',
  '콘도르',
  '플라밍고',
  '황새',
  '두루미',
  '갈매기',
  '물떼새',
  '딱따구리',
  '박쥐',
  '고래',
  '돌고래',
  '상어',
  '가오리',
  '문어',
  '오징어',
  '해파리',
  '불가사리',
  '게',
  '랍스터',
  '새우',
  '조개',
  '소라',
  '굴',
  '홍합',
  '말미잘',
  '산호',
  '해마',
  '물개',
  '바다사자',
  '바다표범',
  '해달',
  '북극곰',
  '펭귄',
  '순록',
  '들소',
  '영양',
  '가젤',
  '임팔라',
];

/**
 * 랜덤한 익명 사용자 이름을 생성합니다.
 * @returns {string} 수식어와 동물 이름이 조합된 익명 사용자 이름
 */
export function generateAnonymousName(): string {
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

  return `${randomAdjective} ${randomAnimal}`;
}

/**
 * 사용자 ID를 기반으로 일관된 익명 사용자 이름을 생성합니다.
 * 같은 사용자 ID에 대해 항상 같은 이름이 생성됩니다.
 * @param {string} userId 사용자 ID
 * @returns {string} 수식어와 동물 이름이 조합된 익명 사용자 이름
 */
export function generateConsistentAnonymousName(userId: string): string {
  // userId를 숫자로 변환 (간단한 해시 함수)
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash = hash & hash; // 32비트 정수로 변환
  }

  // 절대값 사용
  hash = Math.abs(hash);

  const adjectiveIndex = hash % adjectives.length;
  const animalIndex = Math.floor(hash / adjectives.length) % animals.length;

  return `${adjectives[adjectiveIndex]} ${animals[animalIndex]}`;
}

/**
 * 모든 가능한 조합의 수를 반환합니다.
 * @returns {number} 가능한 모든 익명 이름 조합의 수
 */
export function getTotalCombinations(): number {
  return adjectives.length * animals.length;
}

/**
 * 특정 인덱스의 조합을 반환합니다.
 * @param {number} index 0부터 시작하는 조합 인덱스
 * @returns {string} 해당 인덱스의 익명 이름 조합
 */
export function getNameByIndex(index: number): string {
  if (index < 0 || index >= getTotalCombinations()) {
    throw new Error('인덱스가 범위를 벗어났습니다.');
  }

  const adjectiveIndex = index % adjectives.length;
  const animalIndex = Math.floor(index / adjectives.length);

  return `${adjectives[adjectiveIndex]} ${animals[animalIndex]}`;
}
