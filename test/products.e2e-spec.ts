import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Products (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.product.deleteMany();

    // Seed products
    await prisma.product.createMany({
      data: [
        { name: 'Laptop Pro', description: 'Powerful laptop', price: 1500, category: 'Electronics', sku: 'LAP-001' },
        { name: 'Smartphone X', description: 'Latest smartphone', price: 1000, category: 'Electronics', sku: 'PHO-001' },
        { name: 'Office Chair', description: 'Ergonomic chair', price: 200, category: 'Furniture', sku: 'CHA-001' },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/products', () => {
    it('should return all products with default pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.length).toBe(3);
      expect(response.body.meta.total).toBe(3);
    });

    it('should paginate results', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?limit=2&page=1')
        .expect(200);

      expect(response.body.data.length).toBe(2);
      expect(response.body.meta.totalPages).toBe(2);
    });

    it('should filter by search term (case-insensitive)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?search=LAPTOP')
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Laptop Pro');
    });

    it('should filter by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?category=Furniture')
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Office Chair');
    });

    it('should sort results case-insensitively', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?sort=desc')
        .expect(200);

      expect(response.body.data[0].name).toBe('Smartphone X'); // S comes after O and L
    });

    it('should return empty list if no results found', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?search=nonexistent')
        .expect(200);

      expect(response.body.data.length).toBe(0);
      expect(response.body.meta.total).toBe(0);
    });
  });
});
