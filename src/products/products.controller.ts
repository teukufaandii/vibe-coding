import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { GetProductsDto } from './dto/get-products.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully.' })
  async findAll(@Query() query: GetProductsDto) {
    return this.productsService.findAll(query);
  }
}
