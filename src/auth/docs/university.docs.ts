import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

export const UniversityDocs = {
  controller: () => applyDecorators(
    ApiTags('학적 관리')
  ),
  
  getAll: () => applyDecorators(
    ApiOperation({ summary: '대학 목록 조회', description: '대학 목록을 조회합니다.' }),
    ApiQuery({
      name: "name",
      type: String,
      description: "대학 이름(선택)",
      required: false
    }),
    ApiResponse({ status: 200, description: '대학 목록', schema: { type: 'array', items: { type: 'string' } } })
  ),
  
  getDepartments: () => applyDecorators(
    ApiOperation({ summary: '대학 학과 목록 조회', description: '대학 학과 목록을 조회합니다.' }),
    ApiQuery({
      name: "university",
      type: String,
      description: "대학 이름(필수)",
      required: true
    }),
    ApiResponse({ status: 200, description: '대학 학과 목록', schema: { type: 'array', items: { type: 'string' } } })
  ),
  
  registerUniversity: () => applyDecorators(
    ApiOperation({ 
      summary: '대학 인증 요청', 
      description: '대학교 인증을 요청합니다. 어드민에서 확인후 인증처리할 수 있습니다.\n 이미 대학정보가 등록되어있을때 기존 정보를 삭제하고 새로운 정보를 업로드합니다. 이때 인증은 무효됩니다.' 
    })
  )
};
