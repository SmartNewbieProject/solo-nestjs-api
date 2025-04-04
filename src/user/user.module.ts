import { Module } from "@nestjs/common";
import ProfileController from "./controller/profile.controller";
import ProfileRepository from "./repository/profile.repository";
import { ProfileService } from "./services/profile.service";

@Module({
  imports: [],
  controllers: [ProfileController],
  providers: [
    ProfileRepository,
    ProfileService,
  ],
  exports: [],
})
export class UserModule {}
