import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetProductsDto } from './dto/get-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetProductsDto) {
    try {
      const { page = 1, limit = 10, search, category, sort = 'ASC' } = query;
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null,
      };

      if (category) {
        where.category = category;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [data, total] = await this.prisma.$transaction([
        this.prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            name: sort.toLowerCase() as 'asc' | 'desc',
          },
        }),
        this.prisma.product.count({ where }),
      ]);

      return {
        status: 'success',
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
