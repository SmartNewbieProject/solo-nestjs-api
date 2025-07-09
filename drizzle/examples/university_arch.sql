-- ================================================
-- 대학교 정보 관리 시스템 데이터베이스 설계 (단순화된 최종 버전)
-- ================================================

-- UUID 확장 모듈 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 대한민국 시 지역 코드 ENUM 타입 생성 (주요 대학 소재 도시 중심)
CREATE TYPE region_code AS ENUM (
    -- 특별시, 광역시, 특별자치시
    'SEL',  -- 서울특별시
    'BSN',  -- 부산광역시
    'DAG',  -- 대구광역시
    'ICN',  -- 인천광역시
    'GWJ',  -- 광주광역시
    'DJN',  -- 대전광역시
    'ULS',  -- 울산광역시
    'SJG',  -- 세종특별자치시

    -- 경기도 주요 시
    'SWN',  -- 수원시
    'YGN',  -- 용인시
    'SGN',  -- 성남시
    'AYG',  -- 안양시
    'ASN',  -- 안산시
    'BCN',  -- 부천시
    'GYG',  -- 고양시
    'GJU',  -- 광주시 (경기도)
    'HWS',  -- 화성시
    'PTK',  -- 평택시
    'UJB',  -- 의정부시
    'ICH',  -- 이천시
    'POC',  -- 포천시
    'ANG',  -- 안성시
    'OSN',  -- 오산시
    'YJU',  -- 양주시

    -- 강원도
    'CCN',  -- 춘천시
    'WJU',  -- 원주시
    'GNG',  -- 강릉시
    'SCO',  -- 속초시
    'SCK',  -- 삼척시

    -- 충청북도
    'CJU',  -- 청주시
    'CGJ',  -- 충주시
    'JCN',  -- 제천시

    -- 충청남도
    'CAN',  -- 천안시
    'GJJ',  -- 공주시
    'ASA',  -- 아산시
    'SSN',  -- 서산시
    'NSN',  -- 논산시
    'BRY',  -- 보령시

    -- 전라북도
    'JJU',  -- 전주시
    'GSN',  -- 군산시
    'IKS',  -- 익산시
    'JEU',  -- 정읍시
    'NWN',  -- 남원시

    -- 전라남도
    'YSU',  -- 여수시
    'SCH',  -- 순천시
    'MKP',  -- 목포시
    'GYY',  -- 광양시
    'NJU',  -- 나주시

    -- 경상북도
    'PHG',  -- 포항시
    'GMI',  -- 구미시
    'GJO',  -- 경주시
    'ADG',  -- 안동시
    'GCN',  -- 김천시
    'GSA',  -- 경산시
    'YJA',  -- 영주시
    'SJU',  -- 상주시
    'YCN',  -- 영천시
    'MGY',  -- 문경시

    -- 경상남도
    'CWN',  -- 창원시
    'JJE',  -- 진주시
    'GHE',  -- 김해시
    'YSN',  -- 양산시
    'GJE',  -- 거제시
    'TYG',  -- 통영시
    'SCN',  -- 사천시
    'MYG',  -- 밀양시

    -- 제주특별자치도
    'JJA',  -- 제주시
    'SGP'   -- 서귀포시
);

-- 2. 대학교 테이블 (universities)
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS universities CASCADE;

CREATE TABLE universities (
                              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                              name VARCHAR(100) NOT NULL,
                              region region_code NOT NULL,
                              established_year INTEGER,
                              university_code VARCHAR(20) UNIQUE,
                              is_active BOOLEAN DEFAULT TRUE,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              UNIQUE(name, region)
);

-- 3. 학과/전공 테이블 (departments)
CREATE TABLE departments (
                             id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                             university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
                             name VARCHAR(100) NOT NULL,
                             is_active BOOLEAN DEFAULT TRUE,
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             UNIQUE(university_id, name)
);

-- 인덱스 생성
CREATE INDEX idx_universities_region ON universities(region);
CREATE INDEX idx_universities_name ON universities(name);
CREATE INDEX idx_departments_university ON departments(university_id);
CREATE INDEX idx_departments_name ON departments(name);

-- ================================================
-- 데이터 삽입 (DML)
-- ================================================

-- 대전/세종/충남/충북 지역 대학교
INSERT INTO universities (name, region, university_code, established_year) VALUES
-- 대전광역시
('건양대학교', 'DJN', 'KYU', 1991),
('대전대학교', 'DJN', 'DJU', 1979),
('목원대학교', 'DJN', 'MWU', 1954),
('배재대학교', 'DJN', 'PJU', 1885),
('우송대학교', 'DJN', 'WSU', 1995),
('한남대학교', 'DJN', 'HNU', 1956),
('충남대학교', 'DJN', 'CNU', 1952),
('KAIST', 'DJN', 'KAIST', 1971),
('한밭대학교', 'DJN', 'HBU', 1927),
('을지대학교', 'DJN', 'EJU', 1967),
('대전보건대학교', 'DJN', 'DHU', 1972),

-- 세종특별자치시
('고려대학교 세종캠퍼스', 'SJG', 'KUS', 2007),
('홍익대학교 세종캠퍼스', 'SJG', 'HIS', 2008),
('한국교원대학교', 'SJG', 'KNUE', 1985),

-- 충청남도
('공주대학교', 'GJJ', 'KNU', 1948),
('공주교육대학교', 'GJJ', 'GJUE', 1938),

-- 충청북도
('충북대학교', 'CJU', 'CBNU', 1951),
('청주교육대학교', 'CJU', 'CJNU', 1941),

-- 부산광역시
('부산대학교', 'BSN', 'PNU', 1946),
('동아대학교', 'BSN', 'DAU', 1946),
('부경대학교', 'BSN', 'PKNU', 1996),
('동의대학교', 'BSN', 'DEU', 1963),
('신라대학교', 'BSN', 'SU', 1964),
('경성대학교', 'BSN', 'KSU', 1955),
('동명대학교', 'BSN', 'TMU', 1987),
('동서대학교', 'BSN', 'DSU', 1992),
('부산외국어대학교', 'BSN', 'BUFS', 1982),
('부산가톨릭대학교', 'BSN', 'CUP', 1964),
('고신대학교', 'BSN', 'KU', 1946),
('영산대학교', 'BSN', 'YSU', 1996),
('인제대학교', 'BSN', 'IU', 1979),
('한국해양대학교', 'BSN', 'KMOU', 1945),
('부산교육대학교', 'BSN', 'BNUE', 1946),
-- 부산 전문대학
('부산과학기술대학교', 'BSN', 'BIST', 1976),
('부산여자대학교', 'BSN', 'BWC', 1969),
('부산보건대학교', 'BSN', 'BHU', 1978),
('부산예술대학교', 'BSN', 'BAC', 1994),
('경남정보대학교', 'BSN', 'KIT', 1965),
('대동대학교', 'BSN', 'DDU', 1971),
('동의과학대학교', 'BSN', 'DIT', 1972),
('부산경상대학교', 'BSN', 'BKC', 1979),
('한국폴리텍VII대학', 'BSN', 'KP7', 1968),
-- 부산 사이버대학
('부산디지털대학교', 'BSN', 'BDU', 2001),
('원광디지털대학교 부산캠퍼스', 'BSN', 'WDU', 2001),
('화신사이버대학교', 'BSN', 'HCU', 2001);

-- ================================================
-- 건양대학교 학과 데이터
-- ================================================

-- 건양대학교 메디컬캠퍼스 학과
INSERT INTO departments (university_id, name) VALUES
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '간호학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '물리치료학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '방사선학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '병원경영학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '안경광학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '응급구조학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '의공학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '의료IT공학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '의료공간디자인학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '의료신소재학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '의약바이오학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '인공지능학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '임상병리학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '작업치료학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '제약생명공학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '치위생학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '의학과'),

-- 건양대학교 창의융합캠퍼스 학과
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '기업소프트웨어학부'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '스마트보안학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '융합디자인학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '임상약학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '글로벌의료뷰티학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '재난안전소방학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '반도체공학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '심리상담치료학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '유아교육과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '특수교육과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '사회복지학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '디지털콘텐츠학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '시각디자인학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '스포츠의학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '재활퍼스널트레이닝학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '경영학부'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '호텔관광학과'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '금융세무학부'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '국방경찰행정학부'),
                                                  ((SELECT id FROM universities WHERE name = '건양대학교'), '군사학과');

-- ================================================
-- 대전대학교 학과 데이터
-- ================================================

INSERT INTO departments (university_id, name) VALUES
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), 'AI소프트웨어학부'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '간호학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '건축공학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '건축학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '경영학부'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '경찰학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '공연예술영상콘텐츠학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '군사학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '디지털헬스케어학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '물리치료학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '물류통상학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '반도체공학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '법행정학부'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '보건의료경영학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '컴퓨터공학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '정보보안학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '정보통신공학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '응급구조학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '소방방재학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '한의예과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '웹툰애니메이션학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '식품영양학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '스포츠건강재활학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전대학교'), '화장품학과');

-- ================================================
-- KAIST 학과 데이터
-- ================================================

INSERT INTO departments (university_id, name) VALUES
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '기술경영학부'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '건설및환경공학과'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '기계공학과'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '바이오및뇌공학과'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '반도체시스템공학과'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '산업디자인학과'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '산업및시스템공학과'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '생명화학공학과'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '신소재공학과'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '원자력및양자공학과'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '전기및전자공학부'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '전산학부'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '항공우주공학과'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '새내기과정학부(공학계열)'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '새내기과정학부(인문사회계열)'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '새내기과정학부(자연계열)'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '융합인재학부'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '뇌인지과학과'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '생명과학과'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '디지털인문사회과학부'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '물리학과'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '수리과학과'),
                                                  ((SELECT id FROM universities WHERE name = 'KAIST'), '화학과');

-- ================================================
-- 부산대학교 주요 학과 데이터
-- ================================================

INSERT INTO departments (university_id, name) VALUES
-- 부산대학교 인문대학
((SELECT id FROM universities WHERE name = '부산대학교'), '국어국문학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '중어중문학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '영어영문학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '독어독문학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '불어불문학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '노어노문학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '일어일문학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '언어학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '사학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '철학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '고고학과'),

-- 부산대학교 공과대학
((SELECT id FROM universities WHERE name = '부산대학교'), '기계공학부'),
((SELECT id FROM universities WHERE name = '부산대학교'), '고분자공학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '유기소재시스템공학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '화학공학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '전기전자공학부'),
((SELECT id FROM universities WHERE name = '부산대학교'), '컴퓨터공학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '건설융합학부'),
((SELECT id FROM universities WHERE name = '부산대학교'), '건축학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '도시공학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '항공우주공학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '산업공학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '조선해양공학과'),

-- 부산대학교 의료계열
((SELECT id FROM universities WHERE name = '부산대학교'), '의예과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '의학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '치의예과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '치의학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '간호학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '약학과'),

-- 부산대학교 자연과학대학
((SELECT id FROM universities WHERE name = '부산대학교'), '수학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '물리학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '화학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '생명과학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '미생물학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '분자생물학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '대기환경과학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '지질환경과학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '해양학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '통계학과'),

-- 부산대학교 기타 학과
((SELECT id FROM universities WHERE name = '부산대학교'), '경영학과'),
((SELECT id FROM universities WHERE name = '부산대학교'), '경제학부'),
((SELECT id FROM universities WHERE name = '부산대학교'), '무역학부');

-- ================================================
-- 동아대학교 주요 학과 데이터
-- ================================================

INSERT INTO departments (university_id, name) VALUES
-- 동아대학교 인문과학대학
((SELECT id FROM universities WHERE name = '동아대학교'), '국어국문학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '중국어중국학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '영어영문학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '일어일문학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '사학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '철학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '문화콘텐츠학과'),

-- 동아대학교 사회과학대학
((SELECT id FROM universities WHERE name = '동아대학교'), '정치외교학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '행정학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '사회복지학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '심리학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '사회학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '신문방송학과'),

-- 동아대학교 경영대학
((SELECT id FROM universities WHERE name = '동아대학교'), '경영학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '경영정보학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '국제무역학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '관광경영학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '유통마케팅학과'),

-- 동아대학교 공과대학
((SELECT id FROM universities WHERE name = '동아대학교'), '전기전자공학부'),
((SELECT id FROM universities WHERE name = '동아대학교'), '컴퓨터공학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '토목공학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '건축공학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '건축학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '화학공학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '환경공학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '신소재공학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '기계공학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '산업경영공학과'),

-- 동아대학교 의료계열
((SELECT id FROM universities WHERE name = '동아대학교'), '의예과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '의학과'),
((SELECT id FROM universities WHERE name = '동아대학교'), '간호학과'),

-- 동아대학교 컴퓨터·AI공학부
((SELECT id FROM universities WHERE name = '동아대학교'), '컴퓨터공학전공'),
((SELECT id FROM universities WHERE name = '동아대학교'), '소프트웨어공학전공'),
((SELECT id FROM universities WHERE name = '동아대학교'), 'AI전공');

-- ================================================
-- 목원대학교 주요 학과 데이터
-- ================================================

INSERT INTO departments (university_id, name) VALUES
                                                  ((SELECT id FROM universities WHERE name = '목원대학교'), 'AI응용학과'),
                                                  ((SELECT id FROM universities WHERE name = '목원대학교'), '건축학부'),
                                                  ((SELECT id FROM universities WHERE name = '목원대학교'), '게임소프트웨어공학과'),
                                                  ((SELECT id FROM universities WHERE name = '목원대학교'), '게임콘텐츠학과'),
                                                  ((SELECT id FROM universities WHERE name = '목원대학교'), '경영학부'),
                                                  ((SELECT id FROM universities WHERE name = '목원대학교'), '경찰법학과'),
                                                  ((SELECT id FROM universities WHERE name = '목원대학교'), '경찰행정학부'),
                                                  ((SELECT id FROM universities WHERE name = '목원대학교'), '컴퓨터공학과'),
                                                  ((SELECT id FROM universities WHERE name = '목원대학교'), '전기전자공학과'),
                                                  ((SELECT id FROM universities WHERE name = '목원대학교'), '미술학부'),
                                                  ((SELECT id FROM universities WHERE name = '목원대학교'), '음악교육과'),
                                                  ((SELECT id FROM universities WHERE name = '목원대학교'), '영어교육과'),
                                                  ((SELECT id FROM universities WHERE name = '목원대학교'), '유아교육과'),
                                                  ((SELECT id FROM universities WHERE name = '목원대학교'), '웹툰학과'),
                                                  ((SELECT id FROM universities WHERE name = '목원대학교'), '애니메이션학과'),
                                                  ((SELECT id FROM universities WHERE name = '목원대학교'), '화장품학과');

-- ================================================
-- 배재대학교 주요 학과 데이터
-- ================================================

INSERT INTO departments (university_id, name) VALUES
                                                  ((SELECT id FROM universities WHERE name = '배재대학교'), 'IT경영정보학과'),
                                                  ((SELECT id FROM universities WHERE name = '배재대학교'), '간호학과'),
                                                  ((SELECT id FROM universities WHERE name = '배재대학교'), '건축학과'),
                                                  ((SELECT id FROM universities WHERE name = '배재대학교'), '경영학과'),
                                                  ((SELECT id FROM universities WHERE name = '배재대학교'), '경찰법학부'),
                                                  ((SELECT id FROM universities WHERE name = '배재대학교'), '드론로봇공학과'),
                                                  ((SELECT id FROM universities WHERE name = '배재대학교'), '소프트웨어공학부(게임공학)'),
                                                  ((SELECT id FROM universities WHERE name = '배재대학교'), '소프트웨어공학부(소프트웨어학)'),
                                                  ((SELECT id FROM universities WHERE name = '배재대학교'), '소프트웨어공학부(정보보안학)'),
                                                  ((SELECT id FROM universities WHERE name = '배재대학교'), '소프트웨어공학부(컴퓨터공학)'),
                                                  ((SELECT id FROM universities WHERE name = '배재대학교'), '스마트배터리학과'),
                                                  ((SELECT id FROM universities WHERE name = '배재대학교'), '전기전자공학과'),
                                                  ((SELECT id FROM universities WHERE name = '배재대학교'), '철도건설공학과'),
                                                  ((SELECT id FROM universities WHERE name = '배재대학교'), '항공서비스학과'),
                                                  ((SELECT id FROM universities WHERE name = '배재대학교'), '행정학과'),
                                                  ((SELECT id FROM universities WHERE name = '배재대학교'), '호텔항공경영학과');

-- ================================================
-- 우송대학교 주요 학과 데이터
-- ================================================

INSERT INTO departments (university_id, name) VALUES
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), 'AI·빅데이터학과'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '간호학과'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '글로벌조리학부 글로벌조리전공'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '글로벌호텔매니지먼트학과'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '물리치료학과'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '소프트웨어학부 컴퓨터·소프트웨어전공'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '소프트웨어학부 컴퓨터공학전공'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '솔브릿지경영학부'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '유아교육과'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '융합경영학부 경영학전공'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '응급구조학과'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '철도건설시스템학부 건축공학전공'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '철도건설시스템학부 글로벌철도학과'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '철도건설시스템학부 철도건설시스템전공'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '철도경영학과'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '철도시스템학부 철도소프트웨어전공'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '철도시스템학부 철도전기시스템전공'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '철도차량시스템학과'),
                                                  ((SELECT id FROM universities WHERE name = '우송대학교'), '호텔관광경영학과');

-- ================================================
-- 한남대학교 주요 학과 데이터
-- ================================================

INSERT INTO departments (university_id, name) VALUES
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), 'AI융합학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '간호학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '건축공학전공'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '건축학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '경영정보학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '경영학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '경제학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '경찰학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '기계공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '멀티미디어공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '무역물류학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '빅데이터응용학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '바이오제약공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '법학부'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '사회복지학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '산업경영공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '신소재공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '전기전자공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '정보통신공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '컴퓨터공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '토목환경공학전공'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '화학공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '화학과'),
                                                  ((SELECT id FROM universities WHERE name = '한남대학교'), '회계학과');

-- ================================================
-- 충남대학교 주요 학과 데이터
-- ================================================

INSERT INTO departments (university_id, name) VALUES
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '간호학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '건축학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '경영학부'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '경제학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '기계공학부'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '농업경제학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '메카트로닉스공학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '무역학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '반도체융합학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '생물과학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '수의예과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '수학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '스마트시티건축공학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '신소재공학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '약학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '영어영문학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '의예과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '인공지능학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '자율운항시스템공학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '전기공학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '전자공학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '컴퓨터융합학부'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '토목공학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '항공우주공학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '화학공학교육과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '화학과'),
                                                  ((SELECT id FROM universities WHERE name = '충남대학교'), '환경공학과');

-- ================================================
-- 한밭대학교 주요 학과 데이터
-- ================================================

INSERT INTO departments (university_id, name) VALUES
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '건설환경공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '건축공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '건축학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '경제학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '공공행정학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '기계공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '도시공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '모바일융합공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '반도체시스템공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '산업경영공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '산업디자인학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '설비공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '신소재공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '융합경영학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '인공지능소프트웨어학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '전기공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '전자공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '정보통신공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '지능미디어공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '창의융합학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '컴퓨터공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '화학생명공학과'),
                                                  ((SELECT id FROM universities WHERE name = '한밭대학교'), '회계세무학과');

-- ================================================
-- 고려대학교 세종캠퍼스 주요 학과 데이터
-- ================================================

INSERT INTO departments (university_id, name) VALUES
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '응용수리과학부 – 데이터계산과학'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '반도체물리학부'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '신소재화학과'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '컴퓨터응용소프트웨어학과'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '전자및정보공학과'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '생명정보공학과'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '식품생명공학과'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '전자기계융합공학과'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '환경시스템공학과'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '미래모빌리티학과'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '지능형반도체공학과'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '인공지능사이버보안학과'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '디지털헬스케어공학과'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '약학과'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '융합경영학부 – 글로벌경영'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '융합경영학부 – 디지털경영'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '빅데이터사이언스학부'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '국제스포츠학부 – 스포츠과학'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '국제스포츠학부 – 스포츠비즈니스'),
                                                  ((SELECT id FROM universities WHERE name = '고려대학교 세종캠퍼스'), '스마트도시학부');

-- ================================================
-- 부산 주요 전문대학 학과 데이터 (샘플)
-- ================================================

-- 부산과학기술대학교
INSERT INTO departments (university_id, name) VALUES
                                                  ((SELECT id FROM universities WHERE name = '부산과학기술대학교'), '기계공학계열'),
                                                  ((SELECT id FROM universities WHERE name = '부산과학기술대학교'), '자동차공학계열'),
                                                  ((SELECT id FROM universities WHERE name = '부산과학기술대학교'), '컴퓨터정보과'),
                                                  ((SELECT id FROM universities WHERE name = '부산과학기술대학교'), '전기공학과'),
                                                  ((SELECT id FROM universities WHERE name = '부산과학기술대학교'), '간호학과'),
                                                  ((SELECT id FROM universities WHERE name = '부산과학기술대학교'), '치위생과'),
                                                  ((SELECT id FROM universities WHERE name = '부산과학기술대학교'), '소방안전관리과'),
                                                  ((SELECT id FROM universities WHERE name = '부산과학기술대학교'), '건축과'),
                                                  ((SELECT id FROM universities WHERE name = '부산과학기술대학교'), '유아교육과'),
                                                  ((SELECT id FROM universities WHERE name = '부산과학기술대학교'), '호텔관광경영과');

-- 부산여자대학교
INSERT INTO departments (university_id, name) VALUES
                                                  ((SELECT id FROM universities WHERE name = '부산여자대학교'), '유아교육과'),
                                                  ((SELECT id FROM universities WHERE name = '부산여자대학교'), '아동보육과'),
                                                  ((SELECT id FROM universities WHERE name = '부산여자대학교'), '간호학과'),
                                                  ((SELECT id FROM universities WHERE name = '부산여자대학교'), '치위생과'),
                                                  ((SELECT id FROM universities WHERE name = '부산여자대학교'), '호텔경영과'),
                                                  ((SELECT id FROM universities WHERE name = '부산여자대학교'), '호텔외식조리과'),
                                                  ((SELECT id FROM universities WHERE name = '부산여자대학교'), '미용과'),
                                                  ((SELECT id FROM universities WHERE name = '부산여자대학교'), '사회복지계열'),
                                                  ((SELECT id FROM universities WHERE name = '부산여자대학교'), '안경광학과'),
                                                  ((SELECT id FROM universities WHERE name = '부산여자대학교'), '반려동물과');

-- 대전보건대학교
INSERT INTO departments (university_id, name) VALUES
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), 'HiT자율전공학부'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '간호학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '경찰과학수사학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '국방응급의료과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '물리치료학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '바이오의약과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '반려동물과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '방사선학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '보건의료행정학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '뷰티케어과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '사회복지학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '스포츠건강관리과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '안경광학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '유아교육학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '응급구조학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '임상병리학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '작업치료학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '장례지도과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '재난소방·건설안전과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '치기공학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '치위생학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '컴퓨터정보학과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '패션컬러·스타일리스트과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '호텔조리&제과제빵과'),
                                                  ((SELECT id FROM universities WHERE name = '대전보건대학교'), '환경안전보건학과');

-- ================================================
-- 교육대학 학과 데이터
-- ================================================

-- 한국교원대학교
INSERT INTO departments (university_id, name) VALUES
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '교육학과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '유아교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '초등교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '특수교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '국어교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '영어교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '독어교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '불어교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '중국어교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '윤리교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '일반사회교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '지리교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '역사교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '수학교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '물리교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '화학교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '생물교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '지구과학교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '가정교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '환경교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '기술교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '컴퓨터교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '음악교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '미술교육과'),
                                                  ((SELECT id FROM universities WHERE name = '한국교원대학교'), '체육교육과');

-- 공주교육대학교
INSERT INTO departments (university_id, name) VALUES
                                                  ((SELECT id FROM universities WHERE name = '공주교육대학교'), '국어교육과'),
                                                  ((SELECT id FROM universities WHERE name = '공주교육대학교'), '윤리교육과'),
                                                  ((SELECT id FROM universities WHERE name = '공주교육대학교'), '사회과교육과'),
                                                  ((SELECT id FROM universities WHERE name = '공주교육대학교'), '수학교육과'),
                                                  ((SELECT id FROM universities WHERE name = '공주교육대학교'), '과학교육과'),
                                                  ((SELECT id FROM universities WHERE name = '공주교육대학교'), '실과교육과'),
                                                  ((SELECT id FROM universities WHERE name = '공주교육대학교'), '체육교육과'),
                                                  ((SELECT id FROM universities WHERE name = '공주교육대학교'), '음악교육과'),
                                                  ((SELECT id FROM universities WHERE name = '공주교육대학교'), '미술교육과'),
                                                  ((SELECT id FROM universities WHERE name = '공주교육대학교'), '영어교육과'),
                                                  ((SELECT id FROM universities WHERE name = '공주교육대학교'), '교육학과'),
                                                  ((SELECT id FROM universities WHERE name = '공주교육대학교'), '컴퓨터교육과');

-- 청주교육대학교
INSERT INTO departments (university_id, name) VALUES
                                                  ((SELECT id FROM universities WHERE name = '청주교육대학교'), '윤리교육과'),
                                                  ((SELECT id FROM universities WHERE name = '청주교육대학교'), '국어교육과'),
                                                  ((SELECT id FROM universities WHERE name = '청주교육대학교'), '사회과교육과'),
                                                  ((SELECT id FROM universities WHERE name = '청주교육대학교'), '수학교육과'),
                                                  ((SELECT id FROM universities WHERE name = '청주교육대학교'), '과학교육과'),
                                                  ((SELECT id FROM universities WHERE name = '청주교육대학교'), '체육교육과'),
                                                  ((SELECT id FROM universities WHERE name = '청주교육대학교'), '음악교육과'),
                                                  ((SELECT id FROM universities WHERE name = '청주교육대학교'), '미술교육과'),
                                                  ((SELECT id FROM universities WHERE name = '청주교육대학교'), '실과교육과'),
                                                  ((SELECT id FROM universities WHERE name = '청주교육대학교'), '교육학과'),
                                                  ((SELECT id FROM universities WHERE name = '청주교육대학교'), '영어교육과'),
                                                  ((SELECT id FROM universities WHERE name = '청주교육대학교'), '컴퓨터교육과');

-- 부산교육대학교
INSERT INTO departments (university_id, name) VALUES
                                                  ((SELECT id FROM universities WHERE name = '부산교육대학교'), '교육학과'),
                                                  ((SELECT id FROM universities WHERE name = '부산교육대학교'), '국어교육과'),
                                                  ((SELECT id FROM universities WHERE name = '부산교육대학교'), '사회교육과'),
                                                  ((SELECT id FROM universities WHERE name = '부산교육대학교'), '윤리교육과'),
                                                  ((SELECT id FROM universities WHERE name = '부산교육대학교'), '수학교육과'),
                                                  ((SELECT id FROM universities WHERE name = '부산교육대학교'), '과학교육과'),
                                                  ((SELECT id FROM universities WHERE name = '부산교육대학교'), '체육교육과'),
                                                  ((SELECT id FROM universities WHERE name = '부산교육대학교'), '음악교육과'),
                                                  ((SELECT id FROM universities WHERE name = '부산교육대학교'), '미술교육과'),
                                                  ((SELECT id FROM universities WHERE name = '부산교육대학교'), '실과교육과'),
                                                  ((SELECT id FROM universities WHERE name = '부산교육대학교'), '영어교육과'),
                                                  ((SELECT id FROM universities WHERE name = '부산교육대학교'), '컴퓨터교육과');

-- ================================================
-- 데이터 조회 및 검증 쿼리
-- ================================================

-- 지역별 대학교 수 조회
SELECT
    region,
    COUNT(*) as university_count
FROM universities
WHERE is_active = TRUE
GROUP BY region
ORDER BY university_count DESC, region;

-- 대학교별 학과 수 조회
SELECT
    u.name as university_name,
    u.region,
    COUNT(d.id) as department_count
FROM universities u
         LEFT JOIN departments d ON u.id = d.university_id AND d.is_active = TRUE
WHERE u.is_active = TRUE
GROUP BY u.id, u.name, u.region
ORDER BY department_count DESC, u.name;

-- 학과명으로 대학교 검색 예시
SELECT
    u.name as university_name,
    u.region,
    d.name as department_name
FROM universities u
         JOIN departments d ON u.id = d.university_id
WHERE d.name LIKE '%컴퓨터%'
   OR d.name LIKE '%소프트웨어%'
   OR d.name LIKE '%AI%'
   OR d.name LIKE '%인공지능%'
ORDER BY u.region, u.name;

-- 지역별 의료계열 학과 조회
SELECT
    u.name as university_name,
    u.region,
    d.name as department_name
FROM universities u
         JOIN departments d ON u.id = d.university_id
WHERE d.name LIKE '%의학%'
   OR d.name LIKE '%간호%'
   OR d.name LIKE '%치%'
   OR d.name LIKE '%약학%'
ORDER BY u.region, u.name, d.name;

-- 전체 통계 조회
SELECT
    '총 대학교 수' as category,
    COUNT(*) as count
FROM universities
WHERE is_active = TRUE

UNION ALL

SELECT
    '총 학과 수' as category,
    COUNT(*) as count
FROM departments
WHERE is_active = TRUE;

-- ================================================
-- 성능 최적화를 위한 추가 인덱스
-- ================================================

-- 복합 인덱스 생성
CREATE INDEX idx_universities_region_name ON universities(region, name);
CREATE INDEX idx_departments_university_name ON departments(university_id, name);
CREATE INDEX idx_departments_name_search ON departments(name) WHERE is_active = TRUE;

-- 텍스트 검색을 위한 인덱스 (PostgreSQL의 경우)
CREATE INDEX idx_departments_name_gin ON departments USING gin(to_tsvector('korean', name));

-- ================================================
-- 뷰 생성 (자주 사용되는 조회 패턴)
-- ================================================

-- 대학교-학과 통합 뷰
CREATE OR REPLACE VIEW university_departments_view AS
SELECT
    u.id as university_id,
    u.name as university_name,
    u.region,
    u.university_code,
    u.established_year,
    d.id as department_id,
    d.name as department_name
FROM universities u
         LEFT JOIN departments d ON u.id = d.university_id
WHERE u.is_active = TRUE AND (d.is_active = TRUE OR d.id IS NULL);

-- 지역별 대학교 통계 뷰
CREATE OR REPLACE VIEW regional_university_stats AS
SELECT
    region,
    COUNT(*) as total_universities,
    STRING_AGG(name, ', ' ORDER BY name) as university_list
FROM universities
WHERE is_active = TRUE
GROUP BY region
ORDER BY total_universities DESC;

-- ================================================
-- 스키마 완료
-- ================================================

COMMENT ON TABLE universities IS '대학교 정보 테이블 (단순화 버전)';
COMMENT ON TABLE departments IS '학과/전공 정보 테이블 (단순화 버전)';
COMMENT ON COLUMN universities.region IS '대학교 소재 시/도 (ENUM 타입으로 관리)';
COMMENT ON COLUMN universities.university_code IS '대학교 고유 코드';
COMMENT ON COLUMN departments.name IS '학과/전공명';

-- 마지막 업데이트 시각 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_universities_modtime
    BEFORE UPDATE ON universities
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_departments_modtime
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();