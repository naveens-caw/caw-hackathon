import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  it('returns health status', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getVersion: () => ({ version: '0.1.0', env: 'development' as const }),
          },
        },
      ],
    }).compile();

    const controller = moduleRef.get(AppController);
    expect(controller.health()).toEqual({ ok: true });
  });
});