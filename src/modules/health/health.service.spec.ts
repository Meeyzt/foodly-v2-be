import { Test } from '@nestjs/testing';

import { PrismaService } from '../../database/prisma.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(HealthService);
  });

  it('should return ok status', async () => {
    const result = await service.check();

    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });
});
