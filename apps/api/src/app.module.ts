import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { DbModule } from './db.module.js';
import { validateEnv } from './env.js';
import { RbacDemoController } from './rbac-demo.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    DbModule,
    AuthModule,
  ],
  controllers: [AppController, RbacDemoController],
  providers: [AppService],
})
export class AppModule {}
