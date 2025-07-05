PRD: 본인 및 상대방 성향 구분 기능 도입
1. 개요 (Overview)
   본 문서는 기존의 '상대방에게 원하는 성향' 입력 기능에 더해, **'사용자 본인의 성향'**을 입력하고 관리할 수 있는 기능을 추가하기 위한 요구사항을 정의합니다. 이를 위해 user_preference_options 테이블에 사용자의 성향 정보를 구분할 수 있는 Flag(식별자) 컬럼을 추가하고, 관련 API 및 UI를 수정/개발하는 것을 목표로 합니다.

2. 배경 (Background)
   현재 시스템은 사용자가 매칭을 원하는 상대방의 성향(user_preference_options)만을 저장하고 있습니다. 서비스 고도화를 위해 사용자 자신의 성향 데이터를 수집하고, 이를 바탕으로 더욱 정교한 매칭 알고리즘을 구현하거나 프로필에 노출하는 등 다양한 기능을 제공할 필요성이 대두되었습니다.

본인 성향 입력 기능은 향후 개인화된 추천, 사용자 데이터 분석 등 서비스 확장의 기반이 될 중요한 기능입니다.

3. 목표 (Goals)
   데이터 확장성 확보: 하나의 테이블(user_preference_options)에서 본인 성향과 상대방 희망 성향을 모두 저장하고 관리할 수 있는 구조를 마련합니다.

데이터 무결성 유지: 기존에 저장된 '상대방 희망 성향' 데이터는 명확하게 구분되어 유지되어야 하며, 신규 기능으로 인해 데이터의 혼동이 발생하지 않아야 합니다.

사용자 경험 개선: 사용자가 자신의 성향을 쉽고 직관적으로 입력하고 수정할 수 있는 UI/UX를 제공합니다.

4. 기능 요구사항 (Functional Requirements)
   4.1. 데이터베이스 (Database)
   user_preference_options 테이블에 성향의 주체를 구분하는 컬럼을 추가합니다.

컬럼명 (제안): preference_target

데이터 타입 (제안): ENUM 또는 VARCHAR

값 (제안):

'SELF': 사용자 본인의 성향

'PARTNER': 상대방에게 원하는 성향 (기존 데이터)

제약조건: NOT NULL (항상 값이 존재해야 함)

Mermaid ERD 예시:

코드 스니펫

erDiagram
users {
bigint id PK
varchar name
...
}

    user_preference_options {
        bigint id PK
        bigint user_id FK
        varchar category
        varchar option
        ENUM('SELF', 'PARTNER') preference_target "New Column"
    }

    users ||--o{ user_preference_options : "has"
4.2. 데이터 마이그레이션 (Data Migration)
기존 user_preference_options 테이블에 존재하는 모든 데이터의 preference_target 컬럼 값을 'PARTNER'로 일괄 업데이트하는 마이그레이션 스크립트를 작성해야 합니다. 이는 기존 데이터가 모두 '상대방에게 원하는 성향'이었으므로, 데이터의 정합성을 맞추기 위함입니다.

4.3. 백엔드 / API (Backend / API)
성향 정보 조회 (GET):

GET /api/users/{id}/preferences 와 같은 기존 API는 preference_target (SELF 또는 PARTNER)을 쿼리 파라미터로 받아 필터링된 결과를 반환하도록 수정합니다.

파라미터가 없는 경우, 기본값(PARTNER) 또는 두 종류의 성향을 모두 반환하는 것을 정책적으로 결정해야 합니다. (모두 반환하는 것을 권장)

성향 정보 생성/수정 (POST/PUT):

POST /api/users/{id}/preferences 와 같은 API의 Request Body에 preference_target 필드를 추가하여, 어떤 종류의 성향을 저장할 것인지 명시적으로 받습니다.

서버는 해당 값을 기반으로 DB에 저장합니다.

4.4. 프론트엔드 (Frontend)
UI/UX 디자인:

사용자가 '내 성향'과 '원하는 상대방 성향'을 명확히 구분하여 입력할 수 있는 화면을 설계합니다. (예: 탭(Tab)으로 분리된 화면)

'내 프로필' 또는 '성향 관리' 페이지에서 본인이 입력한 두 종류의 성향을 모두 확인할 수 있어야 합니다.

5. 비기능 요구사항 (Non-Functional Requirements)
   성능 (Performance): 새로운 컬럼 추가 및 쿼리 조건 변경으로 인해 기존 성향 조회 API의 성능 저하가 발생하지 않아야 합니다. preference_target 컬럼에 인덱스(Index) 생성을 검토합니다.

보안 (Security): 사용자는 본인의 성향 정보만 수정/조회할 수 있어야 합니다. (기존 권한 정책 유지)

6. 성공 지표 (Success Metrics)
   기능 활성 사용자 수: 본인 성향을 1개 이상 입력한 사용자 수

데이터 축적량: preference_target이 'SELF'인 데이터의 총 개수

