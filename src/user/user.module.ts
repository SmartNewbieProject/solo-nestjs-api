import { Module } from "@nestjs/common";
import ProfileController from "./controller/profile.controller";
import ProfileRepository from "./repository/profile.repository";
import { ProfileService } from "./services/profile.service";
import { AuthRepository } from "@/auth/repository/auth.repository";
import { CommonModule } from "@/common/common.module";
import { ImageService } from "./services/image.service";
import { ImageController } from "./controller/image.controller";
import UserController from "./controller/user.controller";

@Module({
  imports: [CommonModule],
  controllers: [ProfileController, ImageController, UserController],
  providers: [
    AuthRepository,
    ProfileRepository,
    ProfileService,
    ImageService,
  ],
  exports: [],
})
export class UserModule {}
