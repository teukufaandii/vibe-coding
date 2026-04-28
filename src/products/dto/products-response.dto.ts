import { ApiProperty } from '@nestjs/swagger';

class ProductItem {
  @ApiProperty({ example: 'uuid-123' })
  id: string;

  @ApiProperty({ example: 'SKU001' })
  sku: string;

  @ApiProperty({ example: 'Laptop Pro' })
  name: string;

  @ApiProperty({ example: 'A powerful laptop' })
  description: string;

  @ApiProperty({ example: 1500.00 })
  price: number;

  @ApiProperty({ example: 50 })
  stock: number;

  @ApiProperty({ example: 'Electronics' })
  category: string;
}

class PaginationMeta {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class ProductsResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ type: [ProductItem] })
  data: ProductItem[];

  @ApiProperty({ type: PaginationMeta })
  meta: PaginationMeta;
}
