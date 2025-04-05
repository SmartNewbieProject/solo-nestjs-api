import { Module } from "@nestjs/common";
import ProfileController from "./controller/profile.controller";
import ProfileRepository from "./repository/profile.repository";
import { ProfileService } from "./services/profile.service";
import { AuthRepository } from "@/auth/repository/auth.repository";

@Module({
  imports: [],
  controllers: [ProfileController],
  providers: [
    AuthRepository,
    ProfileRepository,
    ProfileService,
  ],
  exports: [],
})
export class UserModule {}
