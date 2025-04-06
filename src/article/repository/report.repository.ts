import { Injectable } from '@nestjs/common';
import { reports } from '@/database/schema';
import { ReportUpload } from '../dto';
import { generateUuidV7 } from '@/database/schema/helper';
import * as schema from '@database/schema';
import { InjectDrizzle } from '@/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ReportStatus } from '@/types/enum';

@Injectable()
export class ReportRepository {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async createReport(postId: string, reporterId: string, reportedId: string, data: ReportUpload) {
    const id = generateUuidV7();

    const result = await this.db.insert(reports).values({
      id,
      postId,
      reporterId,
      reportedId,
      reason: data.reason,
      status: ReportStatus.PENDING,
    }).returning();

    return result[0];
  }
}
