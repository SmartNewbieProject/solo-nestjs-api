import { Injectable, Logger } from '@nestjs/common';
import { Gender } from '@/types/enum';
import { getUniversities, getDepartmentsByUniversity } from '@/auth/domain/university';
import { getUnivLogoByString, getAllUniversityLogos } from '@/shared/libs/univ';

@Injectable()
export class AiProfileService {
  private readonly logger = new Logger(AiProfileService.name);
  private readonly maleNames = [
    '민준', '서준', '도윤', '예준', '시우', '하준', '주원', '지호', '지후', '준서',
    '건우', '현우', '우진', '선우', '연우', '정우', '승우', '민성', '준혁', '지환',
    '승현', '시현', '지원', '태윤', '승민', '지안', '윤우', '태민', '현준', '민규'
  ];

  private readonly femaleNames = [
    '서연', '서윤', '지우', '서현', '민서', '하은', '지유', '예은', '소율', '지민',
    '채원', '수아', '다은', '예린', '하윤', '윤서', '채은', '지원', '유나', '시은',
    '예나', '서영', '지아', '하린', '수빈', '예원', '채윤', '서진', '유진', '다인'
  ];

  constructor() {
    // 초기화 시 대학교 로고 매핑 정보 로그 출력
    this.logger.log('대학교 로고 매핑 정보:');
    const logoMappings = getAllUniversityLogos();
    Object.entries(logoMappings).forEach(([univ, logo]) => {
      this.logger.debug(`${univ}: ${logo || 'null'}`);
    });
  }

  private readonly grades = ['1학년', '2학년', '3학년', '4학년'];

  /**
   * 랜덤 AI 프로필 생성
   */
  generateRandomProfile() {
    const gender = Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE;
    const names = gender === Gender.MALE ? this.maleNames : this.femaleNames;

    // 실제 대학교 목록에서 랜덤 선택
    const universities = getUniversities();
    this.logger.debug(`사용 가능한 대학교 수: ${universities.length}`);
    this.logger.debug(`대학교 목록: ${universities.slice(0, 5).join(', ')}...`);

    const university = universities[Math.floor(Math.random() * universities.length)];
    this.logger.debug(`선택된 대학교: ${university}`);

    // 선택된 대학교의 학과 목록에서 랜덤 선택
    const departments = getDepartmentsByUniversity(university);
    this.logger.debug(`${university}의 학과 수: ${departments.length}`);

    const department = departments.length > 0
      ? departments[Math.floor(Math.random() * departments.length)]
      : '자율전공학부'; // 학과가 없는 경우 기본값
    this.logger.debug(`선택된 학과: ${department}`);

    const name = names[Math.floor(Math.random() * names.length)];
    const grade = this.grades[Math.floor(Math.random() * this.grades.length)];
    const age = Math.floor(Math.random() * 4) + 19; // 19-22세

    // 대학교 로고 URL 안전하게 가져오기 (새로운 유틸리티 사용)
    const universityLogo = getUnivLogoByString(university);
    this.logger.debug(`${university}의 로고 URL: ${universityLogo}`);

    const profile = {
      name,
      gender,
      age,
      university,
      universityLogo,
      department,
      grade,
      isAiGenerated: true,
    };

    this.logger.log(`AI 프로필 생성 완료: ${JSON.stringify(profile)}`);
    return profile;
  }

  /**
   * 랜덤 익명 닉네임 생성 (프로덕션 환경에 맞게 띄어쓰기 포함, 숫자 없음)
   */
  generateAiAnonymousName(): string {
    const adjectives = [
      '똑똑한', '재미있는', '친근한', '활발한', '차분한', '유쾌한', '신비한', '밝은',
      '따뜻한', '시원한', '달콤한', '상큼한', '포근한', '깔끔한', '멋진', '예쁜',
      '귀여운', '사랑스러운', '용감한', '지혜로운', '성실한', '정직한', '순수한', '자유로운'
    ];

    const nouns = [
      '고양이', '강아지', '토끼', '햄스터', '펭귄', '코알라', '판다', '여우',
      '사자', '호랑이', '곰', '늑대', '독수리', '부엉이', '돌고래', '고래',
      '다람쥐', '거북이', '나비', '벌', '개구리', '물고기', '새', '말'
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adjective} ${noun}`;
  }

  /**
   * AI 게시글/댓글용 작성자 정보 생성
   */
  generateAiAuthorInfo(anonymous: boolean = false) {
    const profile = this.generateRandomProfile();

    this.logger.log(`AI 작성자 정보 생성 - 익명: ${anonymous}`);
    this.logger.log(`생성된 프로필: ${JSON.stringify(profile)}`);

    if (anonymous) {
      const authorInfo = {
        name: this.generateAiAnonymousName(),
        displayName: this.generateAiAnonymousName(),
        university: profile.university,
        universityLogo: profile.universityLogo,
        department: profile.department,
        grade: profile.grade,
        gender: profile.gender,
        age: profile.age,
        isAnonymous: true,
        isAiGenerated: true,
      };
      this.logger.log(`익명 작성자 정보: ${JSON.stringify(authorInfo)}`);
      return authorInfo;
    }

    const authorInfo = {
      name: profile.name,
      displayName: profile.name,
      university: profile.university,
      universityLogo: profile.universityLogo,
      department: profile.department,
      grade: profile.grade,
      gender: profile.gender,
      age: profile.age,
      isAnonymous: false,
      isAiGenerated: true,
    };
    this.logger.log(`일반 작성자 정보: ${JSON.stringify(authorInfo)}`);
    return authorInfo;
  }
}
