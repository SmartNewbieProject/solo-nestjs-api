import { Injectable, ConflictException, NotFoundException, BadGatewayException, Logger } from '@nestjs/common';
import { SignupRepository } from '@auth/repository/signup.repository';
import * as bcrypt from 'bcryptjs';
import { SignupRequest } from '@/auth/dto';
import UniversityRepository from '../repository/university.repository';
import { S3Service } from '@/common/services/s3.service';
import { ImageService } from '@/user/services/image.service';
import { uuidv7 } from 'uuidv7';
import SmsService from '@/sms/services/sms.service';
import { generateVerificationCode } from '../domain/code-generator';
import { dayUtils } from '@/common/helper';
import * as dayjs from 'dayjs';

@Injectable()
export class SignupService {
  private readonly logger = new Logger(SignupService.name);

  constructor(
    private readonly signupRepository: SignupRepository,
    private readonly universityRepository: UniversityRepository,
    private readonly s3Service: S3Service,
    private readonly imageService: ImageService,
    private readonly smsService: SmsService,
  ) {}

  checkEmail(email: string) {
    return this.signupRepository.checkEmailExists(email);
  }

  async signup(signupRequest: SignupRequest) {
    const { email, name, phoneNumber } = signupRequest;
    await this.checkVerifySms(phoneNumber);
    const existingUser = await this.checkEmail(email);
    if (existingUser) {
      throw new ConflictException('이미 등록된 이메일입니다.');
    }
    const user = await this.createUser(signupRequest);

    return {
      id: user.id,
      email: user.email,
      name,
      createdAt: user.createdAt,
    };
  }

  async sendVerificationcCode(phoneNumber: string) {
    const id = uuidv7();
    const number = phoneNumber.replaceAll('-', '');
    const authorizationCode = generateVerificationCode();

    const smsVerification = await this.signupRepository.createSmsVerification({
      authorizationCode,
      phoneNumber: number,
      uniqueKey: id,
    })

    await this.smsService.sendSms(
      number,
      `[썸타임]\n회원가입을 위해 인증번호를 입력해주세요.\n인증번호: ${authorizationCode}`
    );

    return smsVerification[0].uniqueKey;
  }

  async matchVerificationCode(uniqueKey: string, authCode: string) {
    const authorizationCode = await this.signupRepository.getAuthorizationCode(uniqueKey);
    if (!authorizationCode) {
      throw new NotFoundException('인증번호가 유효하지 않습니다.');
    }
    const timeover = dayjs(authorizationCode.createdAt)
    .isAfter(dayUtils.create().add(10, 'minutes'));

    if (timeover) {
      throw new BadGatewayException("인증코드 유효시간이 지났습니다.");
    }

    const matches = authorizationCode.authorizationCode === authCode;
    if (!matches) {
      throw new BadGatewayException("인증코드가 일치하지 않습니다.");
    }

    await this.signupRepository.approveAuthorizationCode(authorizationCode.id);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async createUser(signup: SignupRequest) {
    const { profileImages } = signup;
    const password = await this.hashPassword(signup.password);

    const user = await this.signupRepository.createUser({
      ...signup,
      password,
    });
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

  private async checkVerifySms(phoneNumber: string) {
    const exists = await this.signupRepository.existsVerifiedSms(phoneNumber);
    this.logger.debug(exists);
    if (!exists) {
      throw new BadGatewayException("휴대폰 인증을 수행해주세요.");
    }
  }
}
