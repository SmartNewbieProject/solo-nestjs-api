import { InjectDrizzle } from '@/common';
import { Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@database/schema';
import { eq, desc } from 'drizzle-orm';
import { generateUuidV7 } from '@/database/schema/helper';
import { Metadata } from '../types/metadata.type';

@Injectable()
export default class VersionUpdatesRepository {
  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getLatestVersion() {
    const results = await this.db
      .select()
      .from(schema.versionUpdates)
      .orderBy(desc(schema.versionUpdates.createdAt))
      .limit(1);

    return results[0];
  }

  async getAllVersions() {
    return await this.db
      .select()
      .from(schema.versionUpdates)
      .orderBy(desc(schema.versionUpdates.createdAt));
  }

  async getVersionById(id: string) {
    const results = await this.db
      .select()
      .from(schema.versionUpdates)
      .where(eq(schema.versionUpdates.id, id));

    return results[0];
  }

  async createVersion(
    version: string,
    metadata: Metadata,
    shouldUpdate: boolean,
  ) {
    const newVersion = {
      id: generateUuidV7(),
      version,
      metadata,
      shouldUpdate,
    };

    await this.db.insert(schema.versionUpdates).values(newVersion);
    return newVersion;
  }

  async updateVersion(
    id: string,
    version?: string,
    metadata?: Metadata,
    shouldUpdate?: boolean,
  ) {
    const updateData: Partial<{
      version: string;
      metadata: Metadata;
      shouldUpdate: boolean;
    }> = {};
    if (version !== undefined) updateData.version = version;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (shouldUpdate !== undefined) updateData.shouldUpdate = shouldUpdate;

    await this.db
      .update(schema.versionUpdates)
      .set(updateData)
      .where(eq(schema.versionUpdates.id, id));
  }
}
