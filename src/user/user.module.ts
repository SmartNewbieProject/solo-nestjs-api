import { Module } from "@nestjs/common";
import ProfileController from "./controller/profile.controller";
import { PreferenceController } from "./controller/preference.controller";
import ProfileRepository from "./repository/profile.repository";
import { PreferenceRepository } from "./repository/preference.repository";
import { ProfileService } from "./services/profile.service";
import { PreferenceService } from "./services/preference.service";
import { AuthRepository } from "@/auth/repository/auth.repository";
import { CommonModule } from "@/common/common.module";
import { ImageService } from "./services/image.service";
import { ImageController } from "./controller/image.controller";
import UserController from "./controller/user.controller";
import UserRepository from "./repository/user.repository";
import UserService from "./services/user.service";

@Module({
  imports: [CommonModule],
  controllers: [
    ProfileController,
    PreferenceController,
    ImageController,
    UserController
  ],
  providers: [
    AuthRepository,
    ProfileRepository,
    PreferenceRepository,
    ProfileService,
    PreferenceService,
    ImageService,
    UserRepository,
    UserService,
  ],
  exports: [ProfileService, PreferenceService],
})
export class UserModule { }
