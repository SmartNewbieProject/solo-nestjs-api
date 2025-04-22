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
    const universityDetails = userRaw!.profile!.universityDetail;

    const university: UniversityDetail = {
      name: universityDetails!.universityName,
      authentication: universityDetails!.authentication,
      department: universityDetails!.department,
      grade: universityDetails!.grade,
      studentNumber: universityDetails!.studentNumber,
    };

    return {
      age: userRaw!.profile!.age,
      gender: userRaw!.profile!.gender,
      name: userRaw!.name,
      phoneNumber: userRaw!.phoneNumber,
      profileImages: userRaw!.profile!.profileImages.map(d => ({
        id: d.id,
        order: d.imageOrder,
        isMain: d.isMain,
        url: d.image.s3Url,
      })),
      instagramId: userRaw!.profile!.instagramId,
      universityDetails: university,
    };
  }

}
