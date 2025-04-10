import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PasswordUpdated } from "../dto/user";
import UserRepository from "../repository/user.repository";
import * as bcrypt from 'bcryptjs';

@Injectable()
export default class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async updatePassword(userId: string, data: PasswordUpdated) {
    const user = await this.userRepository.getUser(userId);
    const isPasswordCorrect = await bcrypt.compare(data.oldPassword, user.password);
    if (!isPasswordCorrect) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.userRepository.updatePassword(userId, hashedPassword);
  }
}
