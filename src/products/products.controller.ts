import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { GetProductsDto } from './dto/get-products.dto';
import { ProductsResponseDto } from './dto/products-response.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination and filters' })
  @ApiOkResponse({ description: 'Products retrieved successfully.', type: ProductsResponseDto })
  async findAll(@Query() query: GetProductsDto) {
    return this.productsService.findAll(query);
  }
}
