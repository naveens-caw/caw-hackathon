import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ApplicationsController } from './applications.controller.js';
import { HrController } from './hr.controller.js';
import { JobsController } from './jobs.controller.js';
import { JobsService } from './jobs.service.js';

@Module({
  imports: [AuthModule],
  controllers: [JobsController, HrController, ApplicationsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
