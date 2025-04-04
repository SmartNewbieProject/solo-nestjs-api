import { Injectable, ConflictException } from '@nestjs/common';
import { SignupRepository } from '@auth/repository/signup.repository';
import * as bcrypt from 'bcryptjs';
import { SignupRequest } from '@/auth/dto';

@Injectable()
export class SignupService {
  constructor(private readonly signupRepository: SignupRepository) {}

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
    const { email, password, name, age, gender } = signup;
    const hashedPassword = await this.hashPassword(password);

    const user = await this.signupRepository.createUser({
      email,
      password: hashedPassword,
      name,
      age,
      gender,
    });

    return user;
  }
}
