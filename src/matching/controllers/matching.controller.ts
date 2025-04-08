import { Controller } from "@nestjs/common";
import MatchingCreationService from "../services/creation.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@Controller('matching')
@ApiBearerAuth('access-token')
@ApiTags('매칭')
export default class UserMatchingController {
  constructor(
    private readonly matchingCreationService: MatchingCreationService,
  ) {}

}
