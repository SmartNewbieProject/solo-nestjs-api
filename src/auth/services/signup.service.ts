import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { SignupRepository } from '@auth/repository/signup.repository';
import * as bcrypt from 'bcryptjs';
import { Gender } from '@database/schema/enums';
import { SignupRequest } from '@/auth/dto';

@Injectable()
export class SignupService {
  constructor(private readonly signupRepository: SignupRepository) {}

  checkEmail(email: string) {
    return this.signupRepository.checkEmailExists(email);
  }

  async signup(signupRequest: SignupRequest) {
    const { email, password, name, age, gender } = signupRequest;

    const existingUser = await this.checkEmail(email);
    if (existingUser) {
      throw new ConflictException('이미 등록된 이메일입니다.');
    }

    if (!this.isValidPassword(password)) {
      throw new BadRequestException('비밀번호는 최소 8자 이상이며, 문자와 숫자를 포함해야 합니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await this.hashPassword(password);

    // 성별 변환
    const genderEnum = gender === 'MALE' ? Gender.MALE : Gender.FEMALE;

    // 사용자 생성
    const user = await this.signupRepository.createUser({
      email,
      password: hashedPassword,
      name,
      age,
      gender: genderEnum,
    });

    // 민감한 정보 제외하고 반환
    return {
      id: user.id,
      email: user.email,
      name,
      createdAt: user.createdAt,
    };
  }

  private isValidPassword(password: string): boolean {
    // 최소 8자, 문자와 숫자 포함 검사
    return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
