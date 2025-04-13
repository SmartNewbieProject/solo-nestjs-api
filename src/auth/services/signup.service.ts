import { Injectable, ConflictException } from '@nestjs/common';
import { SignupRepository } from '@auth/repository/signup.repository';
import * as bcrypt from 'bcryptjs';
import { SignupRequest } from '@/auth/dto';
import UniversityRepository from '../repository/university.repository';
import { S3Service } from '@/common/services/s3.service';
import { ImageService } from '@/user/services/image.service';

@Injectable()
export class SignupService {
  constructor(
    private readonly signupRepository: SignupRepository,
    private readonly universityRepository: UniversityRepository,
    private readonly s3Service: S3Service,
    private readonly imageService: ImageService,
  ) {}

  checkEmail(email: string) {
    return this.signupRepository.checkEmailExists(email);
  }

  async signup(signupRequest: SignupRequest) {
    const { email, name } = signupRequest;
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
}
