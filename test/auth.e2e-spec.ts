import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let cache: Cache;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get(PrismaService);
    cache = app.get(CACHE_MANAGER);
  });

  beforeEach(async () => {
    // Cleanup Database and Redis
    await prisma.auditLog.deleteMany();
    await prisma.userIdentity.deleteMany();
    await prisma.user.deleteMany();
    await cache.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/users/register', () => {
    const registerDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      captchaToken: 'dummy-token',
    };

    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/register')
        .send(registerDto)
        .expect(201);

      expect(response.body.user.email).toBe(registerDto.email);
      expect(response.body.accessToken).toBeDefined();
    });

    it('should fail if email already exists', async () => {
      await request(app.getHttpServer())
        .post('/api/users/register')
        .send(registerDto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/users/register')
        .send(registerDto)
        .expect(409);

      expect(response.body.message).toContain('email sudah terdaftar');
    });

    it('should fail if validation fails (missing fields)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/register')
        .send({ email: 'invalid' })
        .expect(400);

      expect(response.body.message).toContain('Format email tidak valid');
      expect(response.body.message).toContain('Nama tidak boleh kosong');
      expect(response.body.message).toContain('Captcha token wajib diisi untuk verifikasi keamanan');
    });

    it('should fail if name exceeds 100 characters', async () => {
      const longName = 'a'.repeat(101);
      const response = await request(app.getHttpServer())
        .post('/api/users/register')
        .send({ ...registerDto, name: longName })
        .expect(400);

      expect(response.body.message).toContain('Nama maksimal 100 karakter');
    });
  });

  describe('POST /api/users/login', () => {
    const registerDto = {
      email: 'login@example.com',
      name: 'Login User',
      password: 'password123',
      captchaToken: 'dummy-token',
    };

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/users/register')
        .send(registerDto);
    });

    it('should login successfully and return a token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          email: registerDto.email,
          password: registerDto.password,
        })
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
    });

    it('should fail with invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          email: registerDto.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toContain('Email atau password salah');
    });

    it('should fail if email is not registered', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.message).toContain('Email atau password salah');
    });
  });
});
