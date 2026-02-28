import { Module } from '@nestjs/common';
import { HrController } from './hr.controller.js';
import { JobsController } from './jobs.controller.js';
import { JobsService } from './jobs.service.js';

@Module({
  controllers: [JobsController, HrController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
