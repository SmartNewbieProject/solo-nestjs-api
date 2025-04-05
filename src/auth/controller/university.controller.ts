import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UniversityService } from '../services/university.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public } from '../decorators';
import { UniversityRegister } from '../dto/university';
import { AuthenticationUser } from '@/types';

@Controller('universities')
@ApiTags('인증')
export class UniversityController {
  constructor(private readonly universityService: UniversityService) {}

  @Public()
  @ApiOperation({ summary: '대학 목록 조회', description: '대학 목록을 조회합니다.' })
  @ApiQuery({
    name: "name",
    type: String,
    description: "대학 이름(선택)",
    required: false
  })
  @ApiResponse({ status: 200, description: '대학 목록', schema: { type: 'array', items: { type: 'string' } } })
  @Get()
  async getAll(@Query('name') name?: string) {
    return await this.universityService.getUniversities(name);
  }

  @Public()
  @ApiOperation({ summary: '대학 학과 목록 조회', description: '대학 학과 목록을 조회합니다.' })
  @ApiQuery({
    name: "university",
    type: String,
    description: "대학 이름(필수)",
    required: true
  })
  @ApiResponse({ status: 200, description: '대학 학과 목록', schema: { type: 'array', items: { type: 'string' } } })
  @Get('departments')
  async getDepartments(@Query('university') university: string) {
    return await this.universityService.getDepartments(university);
  }

  @ApiOperation({ summary: '대학 인증 요청', description: '대학교 인증을 요청합니다. 어드민에서 확인후 인증처리할 수 있습니다.\n 이미 대학정보가 등록되어있을때 기존 정보를 삭제하고 새로운 정보를 업로드합니다. 이때 인증은 무효됩니다.' })
  @Post()
  async registerUniversity(@CurrentUser() user: AuthenticationUser, @Body() university: UniversityRegister) {
    return await this.universityService.registerUniversity(user.id, university);
  }

}
