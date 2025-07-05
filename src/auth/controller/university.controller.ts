import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UniversityService } from '../services/university.service';
import { CurrentUser, Public, Roles } from '../decorators';
import { UniversityRegister } from '../dto/university';
import { AuthenticationUser } from '@/types';
import { UniversityDocs } from '../docs/university.docs';
import { Role } from '@/types/enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('universities')
@ApiBearerAuth('access-token')
@UniversityDocs.controller()
export class UniversityController {
  constructor(private readonly universityService: UniversityService) {}

  @Public()
  @UniversityDocs.getAll()
  @Get()
  async getAll(@Query('name') name?: string) {
    return await this.universityService.getUniversities(name);
  }

  @Public()
  @UniversityDocs.getDepartments()
  @Get('departments')
  async getDepartments(@Query('university') university: string) {
    return await this.universityService.getDepartments(university);
  }

  @UniversityDocs.registerUniversity()
  @Post()
  @Roles(Role.USER)
  async registerUniversity(
    @CurrentUser() user: AuthenticationUser,
    @Body() university: UniversityRegister,
  ) {
    return await this.universityService.registerUniversity(user.id, university);
  }
}
