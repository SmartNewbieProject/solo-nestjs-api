import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async testDbConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const isConnected = await this.databaseService.testConnection();
      if (isConnected) {
        return { success: true, message: '데이터베이스 연결 성공!' };
      } else {
        return { success: false, message: '데이터베이스 연결 실패' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `데이터베이스 연결 오류: ${error.message}` 
      };
    }
  }
}
