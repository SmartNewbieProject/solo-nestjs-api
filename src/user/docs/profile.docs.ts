import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ProfileResponseDto,
  UnauthorizedResponseDto,
  NotFoundResponseDto,
} from '../dto/profile-response.dto';
import {
  PreferenceTypeDto,
  PreferenceSaveResponseDto,
  BadRequestResponseDto,
} from '../dto/preference-response.dto';
import {
  SelfPreferencesSave,
  PartnerPreferencesSave,
  MbtiUpdate,
  InstagramId,
} from '../dto/profile.dto';
import { NameUpdated } from '../dto/user';

export const ProfileDocs = {
  controller: () =>
    applyDecorators(ApiTags('프로필'), ApiBearerAuth('access-token')),

  getProfile: () =>
    applyDecorators(
      ApiOperation({
        summary: '프로필 조회',
        description: '사용자 프로필을 조회합니다. 선호도 데이터를 포함합니다.',
      }),
      ApiResponse({
        status: 200,
        description: '프로필 조회 성공',
        type: ProfileResponseDto,
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패',
        type: UnauthorizedResponseDto,
      }),
      ApiResponse({
        status: 404,
        description: '프로필을 찾을 수 없음',
        type: NotFoundResponseDto,
      }),
    ),

  getPreferenceSelf: () =>
    applyDecorators(
      ApiOperation({
        summary: '내 성향 - 가능한 성향 선택 옵션 조회',
        description:
          '내 성향을 입력하는 화면에서 선택할 수 있는 모든 선호도 옵션을 조회합니다.',
      }),
      ApiResponse({
        status: 200,
        description: '선호도 옵션 조회 성공',
        type: [PreferenceTypeDto],
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패',
        type: UnauthorizedResponseDto,
      }),
    ),

  getPreferencePartner: () =>
    applyDecorators(
      ApiOperation({
        summary: '이상형 정보 - 가능한 이상형 선택 옵션 조회',
        description:
          '내 이상형 입력하는 화면에서 선택할 수 있는 모든 선호도 옵션을 조회합니다.',
      }),
      ApiResponse({
        status: 200,
        description: '선호도 옵션 조회 성공',
        type: [PreferenceTypeDto],
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패',
        type: UnauthorizedResponseDto,
      }),
    ),

  updateNickname: () =>
    applyDecorators(
      ApiOperation({
        summary: '닉네임 변경',
        description: '사용자의 닉네임을 변경합니다.',
      }),
      ApiResponse({
        status: 200,
        description: '닉네임 변경 성공',
        schema: {
          type: 'object',
          properties: {
            nickname: {
              type: 'string',
              description: '변경된 닉네임',
              example: '홍길동',
            },
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: '잘못된 요청 형식',
        type: BadRequestResponseDto,
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패',
        type: UnauthorizedResponseDto,
      }),
      ApiBody({
        type: NameUpdated,
      }),
    ),

  updatePreferences: () =>
    applyDecorators(
      ApiOperation({
        summary: '프로필 선호도 저장',
        description: '사용자의 선호도 정보를 저장합니다.',
      }),
      ApiResponse({
        status: 200,
        description: '프로필 선호도 저장 성공',
        type: PreferenceSaveResponseDto,
      }),
      ApiResponse({
        status: 400,
        description: '잘못된 요청 형식',
        type: BadRequestResponseDto,
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패',
        type: UnauthorizedResponseDto,
      }),
    ),

  updateInstagramId: () =>
    applyDecorators(
      ApiOperation({
        summary: '프로필 인스타그램 ID 갱신',
        description: '사용자의 인스타그램 ID를 저장합니다.',
      }),
      ApiBody({
        type: InstagramId,
      }),
    ),

  getPreferenceOptions: () =>
    applyDecorators(
      ApiOperation({
        summary: '선호도 옵션 조회',
        description: '특정 타입의 선호도 옵션을 조회합니다.',
      }),
      ApiResponse({
        status: 200,
        description: '선호도 옵션 조회 성공',
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패',
        type: UnauthorizedResponseDto,
      }),
    ),

  checkPreferenceFill: () =>
    applyDecorators(
      ApiOperation({
        summary: '선호도 입력 여부 확인',
        description: '사용자가 선호도를 입력했는지 확인합니다.',
      }),
      ApiResponse({
        status: 200,
        description: '선호도 입력 여부 확인 성공',
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패',
        type: UnauthorizedResponseDto,
      }),
    ),

  getSelfPreferences: () =>
    applyDecorators(
      ApiOperation({
        summary: '본인 성향 조회',
        description: '현재 로그인한 사용자의 본인 성향 정보를 조회합니다.',
      }),
      ApiResponse({
        status: 200,
        description: '본인 성향 조회 성공',
        schema: {
          example: [
            {
              typeName: '성격 유형',
              selectedOptions: [
                { id: 'option-id-1', displayName: '외향적' },
                { id: 'option-id-2', displayName: '유머러스' },
              ],
            },
          ],
        },
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패',
        type: UnauthorizedResponseDto,
      }),
    ),

  updateSelfPreferences: () =>
    applyDecorators(
      ApiOperation({
        summary: '본인 성향 수정',
        description: '현재 로그인한 사용자의 본인 성향 정보를 수정합니다.',
      }),
      ApiResponse({
        status: 200,
        description: '본인 성향 수정 성공',
        schema: {
          example: {
            id: 'user-id',
            preferences: [
              {
                typeName: '성격 유형',
                selectedOptions: [{ id: 'option-id-1', displayName: '외향적' }],
              },
            ],
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패',
        type: UnauthorizedResponseDto,
      }),
      ApiBody({
        type: SelfPreferencesSave,
      }),
    ),

  updatePartnerPreferences: () =>
    applyDecorators(
      ApiOperation({
        summary: '이상형 선호도 수정',
        description: '현재 로그인한 사용자의 이상형 선호도를 저장합니다.',
      }),
      ApiResponse({
        status: 200,
        description: '이상형 선호도 저장 성공',
        schema: { example: { message: '이상형 선호도가 저장되었습니다.' } },
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패',
        type: UnauthorizedResponseDto,
      }),
      ApiBody({
        type: PartnerPreferencesSave,
      }),
    ),

  getNotifications: () =>
    applyDecorators(
      ApiOperation({
        summary: '공지사항 전달',
        description: '현재 로그인한 사용자에게 공지사항을 전달합니다.',
      }),
      ApiResponse({
        status: 200,
        description: '공지사항 전달 성공',
        schema: { example: { notifications: [] } },
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패',
        type: UnauthorizedResponseDto,
      }),
    ),

  getMbti: () =>
    applyDecorators(
      ApiOperation({
        summary: '내 MBTI 조회',
        description: '현재 로그인한 사용자의 MBTI 정보를 조회합니다.',
      }),
      ApiResponse({
        status: 200,
        description: 'MBTI 조회 성공',
        schema: { example: { mbti: 'INTJ' } },
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패',
        type: UnauthorizedResponseDto,
      }),
    ),

  updateMbti: () =>
    applyDecorators(
      ApiOperation({
        summary: '내 MBTI 수정',
        description: '현재 로그인한 사용자의 MBTI 정보를 수정합니다.',
      }),
      ApiResponse({
        status: 200,
        description: 'MBTI 수정 성공',
        schema: { example: { mbti: 'ENFP' } },
      }),
      ApiResponse({
        status: 401,
        description: '인증 실패',
        type: UnauthorizedResponseDto,
      }),
      ApiBody({
        type: MbtiUpdate,
      }),
    ),
};
