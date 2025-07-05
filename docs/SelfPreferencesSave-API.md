# SelfPreferencesSave API 문서

## 개요
본인 성향 선호도 저장 API입니다. 사용자의 성향과 MBTI 선호도를 동시에 저장할 수 있습니다.

## API 정보
- **Endpoint**: `POST /user/preferences/self`
- **Content-Type**: `application/json`
- **Authorization**: Bearer Token 필요

## 요청 스키마 (Request Schema)

```typescript
interface SelfPreferencesSaveRequest {
  additional: {
    goodMbti: string;    // 선호하는 MBTI
    badMbti: string;     // 싫어하는 MBTI
  };
  preferences: Array<{
    typeName: string;    // 옵션 타입명
    optionIds: string[]; // 선택한 옵션 ID 배열
  }>;
}
```

### 필드 설명
- `additional.goodMbti`: 선호하는 MBTI 유형 (예: "INFP")
- `additional.badMbti`: 싫어하는 MBTI 유형 (예: "ESTJ")
- `preferences`: 사용자 성향 데이터 배열
  - `typeName`: 선호도 카테고리명 (예: "연애 스타일", "관심사")
  - `optionIds`: 해당 카테고리에서 선택한 옵션 ID 배열

## 응답 스키마 (Response Schema)

### 성공 응답 (200 OK)
```typescript
interface SelfPreferencesSaveResponse {
  success: boolean;
  message: string;
  data?: {
    updatedPreferences: number;  // 업데이트된 선호도 수
    additionalPreferences: boolean; // 추가 선호도 저장 여부
  };
}
```

### 에러 응답 (400 Bad Request)
```typescript
interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
```

## 요청 예시 (Request Example)

```json
{
  "additional": {
    "goodMbti": "INFP",
    "badMbti": "ESTJ"
  },
  "preferences": [
    {
      "typeName": "선호 나이대",
      "optionIds": ["977daf95-b50e-4894-aea9-c6e64c78a90d"]
    },
    {
      "typeName": "연애 스타일",
      "optionIds": [
        "44f4e49f-3060-41d7-a0ce-331258c06324",
        "6b128c16-1e9b-4256-8bf7-27f68c7cf0c1",
        "9f6610b4-cd3b-41de-8cc0-06c7e7afa204"
      ]
    },
    {
      "typeName": "음주 선호도",
      "optionIds": ["080e5185-5bd8-47e9-9ce2-eb9ff64fe178"]
    },
    {
      "typeName": "관심사",
      "optionIds": [
        "394e7fcc-5141-4603-8d48-6ba8efe42e0a",
        "c84070de-4194-492a-84d3-18071e7f9e14",
        "bd962b7b-b37d-4833-aed5-a73588c307f8",
        "45f82a3a-621a-44c0-85e8-7fb5b34eaaf6",
        "9f0fb1cd-d364-433a-a371-5d985979255f"
      ]
    },
    {
      "typeName": "라이프스타일",
      "optionIds": [
        "56a3cfcc-3045-469c-ae98-7b1c62ad8df6",
        "ad1ac46f-d8e8-45f2-ac0a-e1bb63141137",
        "457e936f-c451-433a-9dd4-20638c7db55d"
      ]
    },
    {
      "typeName": "MBTI 유형",
      "optionIds": ["2cd83de2-290a-4bcd-94d9-aaac1055d030"]
    },
    {
      "typeName": "군필 여부",
      "optionIds": ["01HNGW1234567890ABCDEF001"]
    },
    {
      "typeName": "성격 유형",
      "optionIds": ["13a5b677-2cca-4776-91ed-aac8c08e0045"]
    },
    {
      "typeName": "흡연 선호도",
      "optionIds": ["dce1747a-f347-4812-8220-b931aceb2ded"]
    },
    {
      "typeName": "문신 선호도",
      "optionIds": ["21fd9662-c281-4294-a800-a7a0252fe637"]
    }
  ]
}
```

## 응답 예시 (Response Example)

### 성공 응답
```json
{
  "success": true,
  "message": "본인 성향 선호도가 성공적으로 저장되었습니다.",
  "data": {
    "updatedPreferences": 10,
    "additionalPreferences": true
  }
}
```

### 에러 응답
```json
{
  "success": false,
  "message": "입력 데이터 검증에 실패했습니다.",
  "errors": [
    {
      "field": "additional.goodMbti",
      "message": "선호하는 MBTI는 필수 입력 항목입니다."
    },
    {
      "field": "preferences.0.optionIds",
      "message": "옵션 ID는 배열이어야 합니다."
    }
  ]
}
```

## 사용법 (JavaScript/TypeScript)

### fetch API 사용
```typescript
async function saveSelfPreferences(token: string, data: SelfPreferencesSaveRequest) {
  try {
    const response = await fetch('/user/preferences/self', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error saving self preferences:', error);
    throw error;
  }
}
```

### axios 사용
```typescript
import axios from 'axios';

async function saveSelfPreferences(data: SelfPreferencesSaveRequest) {
  try {
    const response = await axios.post('/user/preferences/self', data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      throw new Error(error.response?.data?.message || '서버 오류가 발생했습니다.');
    }
    throw error;
  }
}
```

## 주의사항
1. **인증**: 반드시 유효한 JWT 토큰이 필요합니다.
2. **선택 제한**: 각 카테고리마다 최대 선택 개수가 정해져 있습니다.
   - 단일 선택: 선호 나이대, 음주 선호도, MBTI 유형, 군필 여부, 성격 유형, 흡연 선호도, 문신 선호도
   - 복수 선택: 연애 스타일(최대 3개), 관심사(최대 5개), 라이프스타일(최대 3개)
3. **데이터 검증**: 모든 필드는 서버에서 검증되며, 잘못된 데이터 전송 시 400 에러가 반환됩니다.
4. **MBTI 추가 선호도**: `goodMbti`와 `badMbti`는 서로 다른 값이어야 합니다.

## 에러 코드
- `400 Bad Request`: 입력 데이터 검증 실패
- `401 Unauthorized`: 인증 토큰 없음 또는 유효하지 않음
- `403 Forbidden`: 권한 부족
- `500 Internal Server Error`: 서버 내부 오류