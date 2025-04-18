
import { Controller, Get, Query } from "@nestjs/common";
import { PreferenceService } from "../services/preference.service";
import { Roles } from "@/auth/decorators";
import { Role } from "@/auth/domain/user-role.enum";

@Controller('preferences')
@Roles(Role.USER, Role.ADMIN)
export class PreferenceController {
  constructor(
    private readonly preferenceService: PreferenceService,
  ) { }

  @Get('/options')
  async getDrinkOptions(@Query("name") typeName: string) {
    await this.preferenceService.getPreferencesByName(typeName);
  }
}

