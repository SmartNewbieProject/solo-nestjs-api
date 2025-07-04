import { Injectable, NotFoundException, BadGatewayException, Logger, BadRequestException } from '@nestjs/common';
import { SignupRepository } from '@auth/repository/signup.repository';
import { SignupRequest } from '@/auth/dto';
import UniversityRepository from '../repository/university.repository';
import { S3Service } from '@/common/services/s3.service';
import { ImageService } from '@/user/services/image.service';
import { uuidv7 } from 'uuidv7';
import SmsService from '@/sms/services/sms.service';
import { generateVerificationCode } from '../domain/code-generator';
import { dayUtils } from '@/common/helper';
import * as dayjs from 'dayjs';
import axios from 'axios';
import { SlackService } from '@/slack-notification/slack.service';

@Injectable()
export class SignupService {
  private readonly logger = new Logger(SignupService.name);

  constructor(
    private readonly signupRepository: SignupRepository,
    private readonly universityRepository: UniversityRepository,
    private readonly s3Service: S3Service,
    private readonly imageService: ImageService,
    private readonly smsService: SmsService,
    private readonly slackService: SlackService,
    private readonly mailService: MailService,
  ) { }


  async signup(signupRequest: SignupRequest) {
    const user = await this.createUser(signupRequest);
    await this.slackService.sendSignupNotification(signupRequest);

    return {
      id: user.id,
      name: signupRequest.name,
      phoneNumber: signupRequest.phoneNumber,
      createdAt: user.createdAt,
    };
  }



  async sendVerificationcCode(phoneNumber: string) {
    const isBlacklisted =
      await this.signupRepository.isPhoneNumberBlacklisted(phoneNumber);
    if (isBlacklisted) {
      throw new BadRequestException('해당 전화번호로는 가입할 수 없습니다.');
    }

    const id = uuidv7();
    const number = phoneNumber.replaceAll('-', '');
    const authorizationCode = generateVerificationCode();

    const smsVerification = await this.signupRepository.createSmsVerification({
      authorizationCode,
      phoneNumber: number,
      uniqueKey: id,
    });

    await this.smsService.sendSms(
      number,
      `[썸타임]\n회원가입을 위해 인증번호를 입력해주세요.\n인증번호: ${authorizationCode}`,
    );

    return smsVerification[0].uniqueKey;
  }

  async matchVerificationCode(uniqueKey: string, authCode: string) {
    const authorizationCode =
      await this.signupRepository.getAuthorizationCode(uniqueKey);
    if (!authorizationCode) {
      throw new NotFoundException('인증번호가 유효하지 않습니다.');
    }

    const expirationTime = dayjs(authorizationCode.createdAt).add(
      10,
      'minutes',
    );
    const currentTime = dayUtils.create();
    const timeover = currentTime.isAfter(expirationTime);

    if (timeover) {
      throw new BadRequestException('인증코드 유효시간이 지났습니다.');
    }

    const matches = authorizationCode.authorizationCode === authCode;
    if (!matches) {
      throw new BadGatewayException('인증코드가 일치하지 않습니다.');
    }

    await this.signupRepository.approveAuthorizationCode(authorizationCode.id);
  }

  async validateInstagram(id: string): Promise<boolean> {
    if (!id || id.trim() === '') {
      return false;
    }

    if (!/^[a-zA-Z0-9._]+$/.test(id)) {
      return false;
    }

    try {
      const response = await axios.get(`https://www.instagram.com/${id}/`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      const notFoundIndicators = [
        "Sorry, this page isn't available.",
        'The link you followed may be broken',
        'Page Not Found',
        'content="Instagram">\n<meta property="og:type" content="profile">',
      ];

      const pageNotAvailable = notFoundIndicators.some((indicator) =>
        response.data.includes(indicator),
      );

      const hasProfileData = [
        `"@${id}"`, // 사용자 ID
        `"username":"${id}"`, // JSON 데이터에서 사용자명
        'profile_pic_url', // 프로필 사진 URL
        'full_name', // 전체 이름
        `og:title" content="${id}`, // 메타 태그의 사용자명
        `<title>${id}</title>`, // 페이지 제목의 사용자명
        'biography', // 자기소개
      ].some((indicator) => response.data.includes(indicator));

      this.logger.debug(
        `Instagram validation for ${id}: hasProfileData=${hasProfileData}, pageNotAvailable=${pageNotAvailable}`,
      );

      return hasProfileData && !pageNotAvailable;
    } catch (error) {
      this.logger.error(`Instagram validation error for ${id}:`, error);
      return false;
    }
  }

  private async createUser(signup: SignupRequest) {
    const { profileImages } = signup;

    const user = await this.signupRepository.createUser(signup);
    const university = await this.universityRepository.registerUniversity(user.id, {
      universityName: signup.universityName,
      department: signup.departmentName,
      grade: signup.grade,
      studentNumber: signup.studentNumber,
    });
    await this.signupRepository.updateUniversityId(user.profileId, university.id);

    const folder = `profiles/${user.id}`;

    const uploadImagePromises = profileImages.map(async (file, index) => {
      const isMain = index === 0;
      const result = await this.s3Service.uploadFile(file, folder);
      return await this.imageService.saveProfileImage(
        user.id,
        result.key,
        result.url,
        isMain,
      );
    });

    await Promise.all(uploadImagePromises);

    return user;
  }


}
