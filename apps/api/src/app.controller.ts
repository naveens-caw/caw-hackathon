import { Controller, Get } from '@nestjs/common';
import { versionResponseSchema } from '@caw-hackathon/shared';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  health(): { ok: true } {
    return { ok: true };
  }

  @Get('api/version')
  version() {
    return versionResponseSchema.parse(this.appService.getVersion());
  }
}