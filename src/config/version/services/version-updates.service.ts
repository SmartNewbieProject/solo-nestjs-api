import { Injectable, NotFoundException } from '@nestjs/common';
import VersionUpdatesRepository from '../repository/version-updates.repository';
import { Metadata } from '../types/metadata.type';

@Injectable()
export default class VersionUpdatesService {
  constructor(
    private readonly versionUpdatesRepository: VersionUpdatesRepository,
  ) {}

  async getLatestVersion() {
    const version = await this.versionUpdatesRepository.getLatestVersion();
    if (!version) {
      throw new NotFoundException('버전 정보를 찾을 수 없습니다.');
    }
    return version;
  }

  async getAllVersions() {
    return await this.versionUpdatesRepository.getAllVersions();
  }

  async getVersionById(id: string) {
    const version = await this.versionUpdatesRepository.getVersionById(id);
    if (!version) {
      throw new NotFoundException('버전 정보를 찾을 수 없습니다.');
    }
    return version;
  }

  async createVersion(version: string, metadata: Metadata, shouldUpdate: boolean) {
    return await this.versionUpdatesRepository.createVersion(
      version,
      metadata,
      shouldUpdate,
    );
  }

  async updateVersion(
    id: string,
    version?: string,
    metadata?: Metadata,
    shouldUpdate?: boolean,
  ) {
    const existingVersion =
      await this.versionUpdatesRepository.getVersionById(id);
    if (!existingVersion) {
      throw new NotFoundException('버전 정보를 찾을 수 없습니다.');
    }

    await this.versionUpdatesRepository.updateVersion(
      id,
      version,
      metadata,
      shouldUpdate,
    );
    return await this.versionUpdatesRepository.getVersionById(id);
  }
}
