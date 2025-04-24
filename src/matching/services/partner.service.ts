import { PartnerDetails } from "@/types/match";
import { UserProfile } from "@/types/user";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PartnerService {
  convertUserProfile(userProfile: UserProfile): PartnerDetails {
    return {
      age: userProfile.age,
      gender: userProfile.gender,
      id: userProfile.id,
      instagramId: userProfile.instagramId || '',
      name: userProfile.name,
      preferences: userProfile.preferences,
      university: userProfile.universityDetails ? {
        department: userProfile.universityDetails.department,
        grade: userProfile.universityDetails.grade,
        name: userProfile.universityDetails.name,
        studentNumber: userProfile.universityDetails.studentNumber,
      } : null,
    }
  }
};
