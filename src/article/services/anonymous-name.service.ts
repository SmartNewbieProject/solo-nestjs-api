import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { generateConsistentAnonymousName, generateAnonymousName } from '../domain/anonymous-user-generator';

@Injectable()
export class AnonymousNameService {
  private readonly SALT_ROUNDS = 10;
  private readonly FIXED_SALT = '$2a$10$anonymousnamesalt1234567890';

  async generateAnonymousName(name: string): Promise<string> {
    const hashedName = await bcrypt.hash(name, this.FIXED_SALT);
    return generateConsistentAnonymousName(hashedName);
  }

  async getConsistentAnonymousName(name: string): Promise<string> {
    const hashedName = await bcrypt.hash(name, this.FIXED_SALT);
    return generateConsistentAnonymousName(hashedName);
  }
} 
