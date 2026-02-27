import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from './env';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService<AppEnv, true>) {}

  getVersion(): { version: string; env: AppEnv['NODE_ENV'] } {
    const version = this.configService.get<string>('APP_VERSION') ?? '0.1.0';
    const env = (this.configService.get<string>('NODE_ENV') ?? 'development') as AppEnv['NODE_ENV'];

    return {
      version,
      env,
    };
  }
}
