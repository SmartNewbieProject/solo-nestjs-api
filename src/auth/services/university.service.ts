import { Injectable, BadRequestException } from "@nestjs/common";
import { getDepartmentsByUniversity, getUniversities } from "../domain/university";
import { UniversityRegister } from "../dto/university";
import UniversityRepository from "../repository/university.repository";

@Injectable()
export class UniversityService {
  constructor(
    private readonly universityRepository: UniversityRepository,
  ) {}

  async getUniversities(name?: string): Promise<string[]> {
    if (name) {
      return getUniversities().filter(university => university.includes(name));
    }
    return getUniversities();
  }

  async getDepartments(university: string) {
    const departments = getDepartmentsByUniversity(university);
    if (departments.length === 0) {
      throw new BadRequestException('해당 대학교가 등록되어있지 않습니다.');
    }
    return departments;
  }

  async registerUniversity(userId: string, university: UniversityRegister) {
    await this.universityRepository.removeUniversity(userId);
    return await this.universityRepository.registerUniversity(userId, university);
  }
}
