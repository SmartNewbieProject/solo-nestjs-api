import { Controller, Post } from '@nestjs/common';
import { AdminBatchVectorService } from '../services/vector.service';

@Controller('admin/batch')
export class BatchController {
  constructor(private readonly vectorBatcher: AdminBatchVectorService) {}

  @Post('vector')
  async createVector() {
    return this.vectorBatcher.batch();
  }
}
