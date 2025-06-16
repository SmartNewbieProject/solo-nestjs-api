import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiTokenService } from '../services/ai-token.service';
import { AiUserSetupService } from '../services/ai-user-setup.service';
import { Roles } from '@auth/decorators/roles.decorator';
import { Role } from '../domain/user-role.enum';

@Controller('auth/ai-token')
@ApiTags('AI 토큰 관리')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN) // 관리자만 AI 토큰 생성 가능
export class AiTokenController {
  constructor(
    private readonly aiTokenService: AiTokenService,
    private readonly aiUserSetupService: AiUserSetupService,
  ) {}

  @Post('setup')
  @ApiOperation({
    summary: 'AI 사용자 계정 생성',
    description: 'AI 사용자 계정을 데이터베이스에 생성합니다. 관리자만 접근 가능합니다.'
  })
  @ApiResponse({
    status: 201,
    description: 'AI 사용자 계정 생성 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        aiUserId: { type: 'string' },
        exists: { type: 'boolean' }
      }
    }
  })
  async setupAiUser() {
    const exists = await this.aiUserSetupService.checkAiUserExists();
    if (exists) {
      return {
        message: 'AI 사용자 계정이 이미 존재합니다.',
        aiUserId: 'ai-bot-user-id-permanent',
        exists: true
      };
    }

    await this.aiUserSetupService.createAiUser();
    return {
      message: 'AI 사용자 계정이 성공적으로 생성되었습니다.',
      aiUserId: 'ai-bot-user-id-permanent',
      exists: false
    };
  }

  @Post('generate')
  @ApiOperation({
    summary: 'AI 서버용 영구 토큰 생성',
    description: 'AI 서버가 사용할 영구 활성화 토큰을 생성합니다. AI 사용자 계정이 먼저 생성되어야 합니다.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'AI 토큰 생성 성공',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'AI 서버용 영구 토큰' },
        message: { type: 'string', description: '성공 메시지' },
        expiresIn: { type: 'string', description: '만료 시간' }
      }
    }
  })
  async generateAiToken() {
    // AI 사용자 계정 존재 확인
    const aiUserExists = await this.aiUserSetupService.checkAiUserExists();
    if (!aiUserExists) {
      return {
        error: 'AI 사용자 계정이 존재하지 않습니다.',
        message: '먼저 POST /api/auth/ai-token/setup을 호출하여 AI 사용자 계정을 생성하세요.',
        setupRequired: true
      };
    }

    const token = await this.aiTokenService.generatePermanentAiToken();

    return {
      token,
      message: 'AI 서버용 영구 토큰이 생성되었습니다.',
      expiresIn: '10년',
      usage: {
        description: 'AI 서버에서 다음과 같이 사용하세요:',
        example: 'Authorization: Bearer ' + token.substring(0, 20) + '...',
        note: '이 토큰은 10년간 유효하며, USER 권한을 가집니다.'
      }
    };
  }

  @Get('info')
  @ApiOperation({ 
    summary: 'AI 사용자 정보 조회', 
    description: 'AI 봇의 사용자 정보를 조회합니다.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'AI 사용자 정보',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' },
        gender: { type: 'string' }
      }
    }
  })
  async getAiUserInfo() {
    return this.aiTokenService.getAiUserInfo();
  }
}
