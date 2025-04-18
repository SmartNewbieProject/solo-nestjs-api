
import { Controller, Get, Query } from "@nestjs/common";
import { PreferenceService } from "../services/preference.service";
import { Roles } from "@/auth/decorators";
import { Role } from "@/auth/domain/user-role.enum";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("이상형")
@Controller('preferences')
@Roles(Role.USER, Role.ADMIN)
export class PreferenceController {
  constructor(
    private readonly preferenceService: PreferenceService,
  ) { }

  @Get('/options')
  async getDrinkOptions(@Query("name") typeName: string) {
    const results = await this.preferenceService.getPreferencesByName(typeName);
    console.log(results);

    return results;
  }
}
