import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List products with filters and pagination' })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get trending products (newest + most active)' })
  async findTrending() {
    return this.productsService.findTrending();
  }

  @Public()
  @Get('feed')
  @ApiOperation({
    summary: 'AI-ranked product feed (trending for guests, personalized for logged-in users)',
  })
  async findFeed(@CurrentUser('sub') userId: string | undefined) {
    return this.productsService.getFeed(userId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get single product with images, details, category, store' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('farmer', 'agric_enterprise', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  async create(@CurrentUser('sub') userId: string, @Body() dto: CreateProductDto) {
    return this.productsService.create(userId, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('farmer', 'agric_enterprise', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product' })
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('roles') roles: string[],
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, userId, dto, roles.includes('admin'));
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('farmer', 'agric_enterprise', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a product' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('roles') roles: string[],
  ) {
    return this.productsService.remove(id, userId, roles.includes('admin'));
  }
}