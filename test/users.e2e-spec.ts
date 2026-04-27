import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { cleanDatabase } from './utils/database.util';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let cache: Cache;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get(PrismaService);
    cache = app.get(CACHE_MANAGER);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
    await cache.clear();

    const user = {
      email: 'user@example.com',
      name: 'User One',
      password: 'password123',
      captchaToken: 'dummy-token',
    };
    await request(app.getHttpServer()).post('/api/users/register').send(user);
    const loginRes = await request(app.getHttpServer()).post('/api/users/login').send({
      email: user.email,
      password: user.password,
    });
    authToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/users/current', () => {
    it('should return current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.email).toBe('user@example.com');
    });

    it('should fail if no token provided', async () => {
      await request(app.getHttpServer())
        .get('/api/users/current')
        .expect(401);
    });
  });

  describe('POST /api/users/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Logout success');

      await request(app.getHttpServer())
        .get('/api/users/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);
    });

    it('should fail if already logged out', async () => {
      await request(app.getHttpServer())
        .post('/api/users/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/users/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);
    });
  });
});
