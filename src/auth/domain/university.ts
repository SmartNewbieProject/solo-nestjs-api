/**
 * 대학 및 학과 정보 관련 함수
 */

export interface DepartmentsByUniversity {
  [key: string]: string[];
}

/**
 * 대전 지역 대학 목록
 */
export const universities = [
  '건양대학교(메디컬캠퍼스)',
  '대전대학교',
  '목원대학교',
  '배재대학교',
  '우송대학교',
  '한남대학교',
  '충남대학교',
  'KAIST',
  '한밭대학교',
  '을지대학교',
  '대덕대학교',
  '대전과학기술대학교',
  '대전보건대학교',
  '우송정보대학',
];

/**
 * 대학별 학과 정보
 */
export const departmentsByUniversity: DepartmentsByUniversity = {
  '건양대학교': [
    '간호학과', '물리치료학과', '방사선학과', '병원경영학과', '안경광학과', '응급구조학과', '의공학과', '의료IT공학과', '의료공간디자인학과', '의료신소재학과', '의약바이오학과', '인공지능학과', '임상병리학과', '작업치료학과', '제약생명공학과', '치위생학과'
  ],
  '대전대학교': [
    'AI소프트웨어학부', '간호학과', '건축공학과', '건축학과(4)', '경영학부', '경찰학과', '공연예술영상콘텐츠학과', '군사학과', '디지털헬스케어학과', '물리치료학과', '물류통상학과', '반도체공학과', '법행정학부', '보건의료경영학과', '뷰티디자인학과', '비즈니스영어학과', '비즈니스일본어학과', '사회복지학과', '산업·광고심리학과', '상담학과', '소방방재학과', '스포츠건강재활학과', '스포츠운동과학과', '식품영양학과', '웹툰애니메이션학과', '응급구조학과', '임상병리학과', '재난안전공학과', '정보보안학과', '정보통신공학과', '중등특수교육과', '커뮤니케이션디자인학과', '컴퓨터공학과', '토목환경공학과', '패션디자인·비즈니스학과', '한의예과', '협화리버럴아츠칼리지', '협화커뮤니티칼리지', '화장품학과'
  ],
  '목원대학교': [
    'AI응용학과', '건축학부', '게임소프트웨어공학과', '게임콘텐츠학과', '경영학부', '경찰법학과', '경찰행정학부', '공연콘텐츠학과', '관현악학부', '광고홍보커뮤니케이션학부', 
    '국악과', '국어교육과', '국际예술·한국어학부', '금융경제학과', '도시공학과', '도자디자인학과', '마케팅빅데이터학과', '미술교육과', '미술학부', '보건의료행정학과', '부동산금융보험학과', 
    '사회복지학과', '산업디자인학과', '생물산업학부', '섬유·패션디자인학과', '소방방재학과', '수학교육과', '스포츠건강관리학과', '시각커뮤니케이션디자인학과', '식품제약학부', '신학과', 
    '실용음악학부', '애니메이션학과', '역사학과', '연극영화영상학부', '영어교육과', '영어학과', '외식조리·제과제빵학과', '웹툰학과', '유아교육과', '음악교육과', '응급구조학과', '입체조형학부', 
    '자율전공학부', '전기전자공학과', '창의예술자율전공학부', '컴퓨터공학과', '피아노학부', '항공호텔관광경영학과', '화장품학과'
  ],
  '배재대학교': [
    'IT경영정보학과', '간호학과', '건축학과', '경영학과', '경찰법학부', '공연예술학과', '관광경영학과', '광고사진영상학과', '국어국문한국어교육학과', '글로벌비즈니스학과', 
    '글로벌자율융합학부(글로벌IT)', '글로벌자율융합학부(글로벌경영)', '글로벌자율융합학부(직무한국어번역)', '글로벌자율융합학부(한류문화콘텐츠)', '드론로봇공학과', 
    '디자인학부(산업디자인)', '디자인학부(커뮤니케이션디자인)', '레저스포츠학부(스포츠마케팅)', '레저스포츠학부(스포츠지도·건강재활)', '미디어콘텐츠학과', '보건의료복지학과', 
    '뷰티케어학과', ' 생명공학과', '소프트웨어공학부(게임공학)', '소프트웨어공학부(소프트웨어학)', '소프트웨어공학부(정보보안학)', '소프트웨어공학부(컴퓨터공학)', '스마트배터리학과', 
    '식품영양학과', '실내건축학과', '심리상담학과', '아트앤웹툰학부(게임애니메이션)', '아트앤웹툰학부(아트앤웹툰)', '외식조리학과', '원예산림학과', '유아교육과', '의류패션학과', '일본학과', 
    '자율전공학부', '전기전자공학과', '조경학과', '철도건설공학과', '평생교육융합학부(지역소상공비즈니스)', '평생교육융합학부(토털라이프스타일링)', '평생교육융합학부(토털라이프케어)', 
    '항공서비스학과', '행정학과', ' 호텔항공경영학과'
  ],
  '우송대학교': [
    'AI·빅데이터학과', '간호학과', '글로벌조리학부 Lyfe조리전공', '글로벌조리학부 글로벌외식창업전공', '글로벌조리학부 글로벌조리전공', '글로벌호텔매니지먼트학과', 
    '동물의료관리학과', '물류시스템학과', '물리치료학과', '보건의료경영학과', '뷰티디자인경영학과', '사회복지학과', '소방·안전학부', '소프트웨어학부 컴퓨터·소프트웨어전공', 
    '소프트웨어학부 컴퓨터공학전공', '솔브릿지경영학부', '스포츠건강재활학과', '언어치료·청각재활학과', '외식조리영양학과', '외식조리학부 외식·조리경영전공', '외식조리학부 외식조리전공', 
    '외식조리학부 제과제빵·조리전공', '외식조리학부 한식·조리과학전공', '유아교육과', '융합경영학부 경영학전공', '융합경영학부 글로벌융합비즈니스학과', '응급구조학과', '자유전공학부', 
    '작업치료학과', '철도건설시스템학부 건축공학전공', '철도건설시스템학부 글로벌철도학과', '철도건설시스템학부 철도건설시스템전공', '철도경영학과', '철도시스템학부 철도소프트웨어전공', 
    '철도시스템학부 철도전기시스템전공', '철도차량시스템학과', '테크노미디어융합학부 게임멀티미디어전공', '테크노미디어융합학부 글로벌미디어영상학과', '테크노미디어융합학부 미디어디자인·영상전공', 
    ' 호텔관광경영학과', '휴먼디지털인터페이스학부'
  ],
  '한남대학교': [
    'AI융합학과', '간호학과', '건축공학전공', '건축학과(5년제)', '경영정보학과', '경영학과', '경제학과', '경찰학과', '교육학과', '국어교육과', 
    '국어국문·창작학과', '기계공학과', '기독교학과', '린튼글로벌스쿨', '멀티미디어공학과', '무역물류학과', '문헌정보학과', '미디어영상학과', '미술교육과', 
    '바이오제약공학과', '법학부', '빅데이터응용학과', '사학과', '사회복지학과', '사회적경제기업학과', '산업경영공학과', '상담심리학과', '생명시스템과학과', '수학과', 
    '수학교육과', '스포츠과학과', '식품영양학과', '신소재공학과', '아동복지학과', '역사교육과', '영어교육과', '영어영문학과', '융합디자인학과', '응용영어콘텐츠학과', 
    '일어일문학전공', '자율전공학부', '전기전자공학과', '정보통신공학과', '정치·언론학과', '중국경제통상학과', '컴퓨터공학과', '토목환경공학전공', '패션디자인학과', '프랑스어문학전공', 
    '행정학과', ' 호텔항공경영학과', '화학공학과', '화학과', '회계학과', '회화과'
  ],
  '충남대학교': [
    '간호학과', '건설공학교육과', '건축학과(5)', '경영학부', '경제학과', '고고학과', '공공안전융합전공', '관현악과', '교육학과', '국사학과', 
    '국어교육과', '국어국문학과', '국토안보학전공', '기계공학교육과', '기계공학부', '기술교육과', '농업경제학과', '도시·자치융합학과', '독어독문학과', 
    '동물자원생명과학과', '디자인창의학과', '리더십과조직과학전공', '메카트로닉스공학과', '무역학과', '무용학과', '문헌정보학과', '문화와사회융합전공', 
    '물리학과', '미생물·분자생명과학과', '반도체융합학과', '불어불문학과', '사학과', '사회복지학과', '사회학과', '산림환경자원학과', ' 생명정보융합학과', '생물과학과', 
    '생물환경화학과', '생화학과', '소비자학과', '수의예과', '수학과', '수학교육과', '스마트시티건축공학과', '스포츠과학과', '식물자원학과', '식품공학과', '식품영양학과', 
    '신소재공학과', '심리학과', '약학과', '언론정보학과', '언어학과', '에너지공학과', '영어교육과', '영어영문학과', '원예학과', '유기재료공학과', '음악과', '응용생물학과', 
    '응용화학공학과', '의류학과', '의예과', '인공지능학과', '일어일문학과', '자율운항시스템공학과', '자율전공융합학부', '전기공학과', '전자공학과', '정보통계학과', '정치외교학과', 
    '조소과', '중어중문학과', '지역환경토목학과', '지질환경과학과', '천문우주과학과', '철학과', '체육교육과', '컴퓨터융합학부', '토목공학과', '한문학과', '항공우주공학과', '해양안보학전공', 
    '해양환경과학과', '행정학부', '화학공학교육과', '화학과', '환경공학과', '환경소재공학과', '회화과'
  ],
  'KAIST': [
    '기술경영학부', '기술경영학부(IT경영학)', '건설및환경공학과', '기계공학과', '바이오및뇌공학과', '반도체시스템공학과', '산업디자인학과', '산업및시스템공학과', '생명화학공학과', 
    '신소재공학과', '원자력및양자공학과', '전기및전자공학부', '전산학부', '항공우주공학과', '새내기과정학부(공학계열)', '새내기과정학부(인문사회계열)', '새내기과정학부(자연계열)', 
    '융합인재학부', '뇌인지과학과', '생명과학과', '디지털인문사회과학부', '물리학과', '수리과학과', '화학과'
  ],
  '한밭대학교': [
    '건설환경공학과', '건축공학과', '건축학과(5년제)', '경제학과', '공공행정학과', '기계공학과', 
    '기계소재융합시스템공학과 (야)', '도시공학과', '모바일융합공학과', '반도체시스템공학과', '산업경영공학과', 
    '산업디자인학과', '설비공학과', '스포츠건강과학과 (야)', '시각•영상디자인학과', '신소재공학과', '영어영문학과', 
    '융합경영학과', '융합건설시스템학과 (야)', '인공지능소프트웨어학과', '일본어과', '자율전공학부', '전기공학과', 
    '전기시스템공학과 (야)', '전자공학과', '정보통신공학과', '중국어과', '지능미디어공학과', '창의융합학과', '컴퓨터공학과', 
    '화학생명공학과', '회계세무부동산학과 (야)', '회계세무학과'
  ],
  '을지대학교': ['의예과'],
  '대덕대학교': [
    'K-디자인과', 'K-모델과', 'K-방위산업과', 'K-뷰티과', 'K-외식조리과', 'K-웹툰과',
    '경찰행정과', '국방군사과', '드론로봇과', '레저스포츠과', '미래자동차과', '반도체과',
    '사회복지학과', '생활체육과', '소방·산업안전관리과', '스마트홈융합과',
    '워게임과', '자율전공학부', '전기과', '정밀기계공학과', '컴퓨터공학과', '펫토탈케어과'
  ],
  '대전과학기술대학교': [
    '간호학과(4년제)', '경찰경호학과', '광고홍보디자인학과', '글로벌산업학과', '도시건설과', '문헌정보과 (야)', '물리치료과', '미래문화콘텐츠과', 
    '반려동물학과', '보건복지상담과', '부동산재테크과', '부동산행정정보학과', '뷰티디자인계열', '사회복지학과', '스포츠건강관리학과', '식물생활조경학과', 
    '실내건축디자인과', '외식조리제빵계열', '유아교육과', '임상병리과', '전기과', '컴퓨터공학&그래픽과', '컴퓨터소프트웨어공학과', '케어복지상담과 (야)', '치위생과'
  ],
  '대전보건대학교': [ 
    'HiT자율전공학부', '간호학과(4년제)', '경찰과학수사학과', '국방응급의료과', '물리치료학과', '바이오의약과', '반려동물과', '방사선학과',
    '보건의료행정학과', '뷰티케어과', '사회복지학과', '스포츠건강관리과', '안경광학과', '유아교육학과', '응급구조학과', '의무부사관과(응급구조학전공)', '임상병리학과', 
    '작업치료학과', '장례지도과', '재난소방·건설안전과', '치기공학과', '치위생학과', '컴퓨터정보학과', '패션컬러·스타일리스트과', '호텔조리&제과제빵과', '환경안전보건학과'
  ],
  '우송정보대학': [
    'AI응용과', 'K-뷰티학부', 'K-베이커리학부', 'K-푸드조리과', 'e-스포츠과', '간호학과', '글로벌실용예술학부', '동물보건과', '리모델링건축과', '만화웹툰과', 
    '반려동물학부', '보건의료행정과', '뷰티디자인학부', '사회복지과', '산업안전과 (야)', '스마트자동차기계학부', '스마트팩토리과', '외식조리학부', '유아교육과', 
    '일본외식조리학부', '자율전공학부', '재난소방안전관리과', '제과제빵과', '창업조리제빵과', '철도전기안전과', '철도차량운전과', '철도토목안전과 (야)', '호텔관광과'
  ]
};

/**
 * 대학명 목록을 반환하는 함수
 * @returns 대학명 목록
 */
export function getUniversities(): string[] {
  return universities;
}

/**
 * 특정 대학의 학과 목록을 반환하는 함수
 * @param universityName 대학명
 * @returns 학과 목록
 */
export function getDepartmentsByUniversity(universityName: string): string[] {
  return departmentsByUniversity[universityName] || [];
}

/**
 * 모든 대학과 학과 정보를 반환하는 함수
 * @returns 대학별 학과 정보
 */
export function getAllUniversitiesAndDepartments(): DepartmentsByUniversity {
  return departmentsByUniversity;
}
