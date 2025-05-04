import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PasswordUpdated } from "../dto/user";
import UserRepository from "../repository/user.repository";
import * as bcrypt from 'bcryptjs';
import { UniversityDetail, UserDetails } from "@/types/user";

@Injectable()
export default class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) { }

  async updatePassword(userId: string, data: PasswordUpdated) {
    const user = await this.userRepository.getUser(userId);
    const isPasswordCorrect = await bcrypt.compare(data.oldPassword, user.password);
    if (!isPasswordCorrect) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.userRepository.updatePassword(userId, hashedPassword);
  }

  async getUserDetails(userId: string): Promise<UserDetails> {
    const userRaw = await this.userRepository.getMyDetails(userId);

    if (!userRaw || !userRaw.profile) {
      throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
    }

    const profile = userRaw.profile as any;

    const universityDetails = profile.universityDetail;

    const university: UniversityDetail = {
      name: universityDetails?.universityName ?? '',
      authentication: universityDetails?.authentication ?? false,
      department: universityDetails?.department ?? '',
      grade: universityDetails?.grade ?? '',
      studentNumber: universityDetails?.studentNumber ?? '',
    };

    const profileImages = Array.isArray(profile.profileImages)
      ? profile.profileImages.map((d: any) => ({
        id: d.id,
        order: d.imageOrder,
        isMain: d.isMain,
        url: d.image.s3Url,
      }))
      : [];

    const instagramId = profile.instagramId ?? '';

    return {
      id: userRaw.id,
      age: profile.age,
      gender: profile.gender,
      name: userRaw.name,
      phoneNumber: userRaw.phoneNumber,
      profileImages,
      instagramId,
      universityDetails: university,
    };
  }

}
