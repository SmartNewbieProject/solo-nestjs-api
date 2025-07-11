import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PasswordUpdated, WithdrawRequest } from "../dto/user";
import UserRepository from "../repository/user.repository";
import * as bcrypt from 'bcryptjs';
import { UniversityDetail, UserDetails } from "@/types/user";
import { QdrantService } from "@/config/qdrant/qdrant.service";
@Injectable()
export default class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly qdrantService: QdrantService,
  ) { }

  async updatePassword(userId: string, data: PasswordUpdated) {
    const user = await this.userRepository.getUser(userId);

    if (!user.password) {
      throw new BadRequestException('Pass 인증 사용자는 비밀번호 변경이 불가능합니다.');
    }

    const isPasswordCorrect = await bcrypt.compare(data.oldPassword, user.password);
    if (!isPasswordCorrect) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.userRepository.updatePassword(userId, hashedPassword);
  }

  async getProfileIdByUserId(userId: string) {
    return await this.userRepository.getProfileIdByUserId(userId);
  }

  async getUserDetails(userId: string): Promise<UserDetails> {
    const userRaw = await this.userRepository.getMyDetails(userId);

    if (!userRaw || !userRaw.profile) {
      throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
    }

    const profile = userRaw.profile as any;

    const universityDetails = profile.universityDetail;

    const university: UniversityDetail = {
      name: universityDetails?.universityName ?? null,
      authentication: universityDetails?.authentication ?? false,
      department: universityDetails?.department ?? null,
      grade: universityDetails?.grade ?? null,
      studentNumber: universityDetails?.studentNumber ?? null,
    };

    const profileImages = Array.isArray(profile.profileImages)
      ? profile.profileImages.map((d: any) => ({
        id: d.id,
        order: d.imageOrder,
        isMain: d.isMain,
        url: d.image.s3Url,
      }))
      : [];

    const instagramId = profile.instagramId ?? null;

    return {
      id: userRaw.id,
      age: profile.age,
      email: userRaw.email ?? null,
      gender: profile.gender,
      name: userRaw.name,
      phoneNumber: userRaw.phoneNumber,
      profileImages,
      instagramId,
      universityDetails: university,
    };
  }

  async withdraw(userId: string, withdrawRequest: WithdrawRequest) {
    await this.userRepository.withdraw(userId, withdrawRequest);
    await this.qdrantService.deletePoints('profiles', [userId]);
  }

  async deleteQdrantUser(userId: string) {
    await this.qdrantService.deletePoints('profiles', [userId]);
  }

}
