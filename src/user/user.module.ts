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
import { StatsController } from "./controller/stats.controller";
import { StatsService } from "./services/stats.service";
import { StatsRepository } from "./repository/stats.repository";
import { NotificationRepository } from "./repository/notification.repository";
import { NotificationService } from "./services/notification.service";
import { AdminQdrantSyncController } from "./controller/user.controller";

@Module({
  imports: [CommonModule],
  controllers: [
    ProfileController,
    PreferenceController,
    ImageController,
    UserController,
    StatsController,
    AdminQdrantSyncController
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
    StatsService,
    StatsRepository,
    NotificationRepository,
    NotificationService,
  ],
  exports: [ProfileService, PreferenceService, ProfileRepository, ProfileService],
})
export class UserModule { }
