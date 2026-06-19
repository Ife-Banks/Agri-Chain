import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductDetail } from './entities/product-detail.entity';
import { Store } from '../stores/entities/store.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
    @InjectRepository(ProductDetail)
    private readonly detailRepo: Repository<ProductDetail>,
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: ProductQueryDto) {
    const { search, categoryId, minPrice, maxPrice, page = 1, limit = 20 } = query;
    const where: Record<string, unknown> = { isActive: true };

    if (search) where.title = ILike(`%${search}%`);
    if (categoryId) where.categoryId = categoryId;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, unknown>).$gte = minPrice;
      if (maxPrice) (where.price as Record<string, unknown>).$lte = maxPrice;
    }

    const [data, total] = await this.productRepo.findAndCount({
      where,
      relations: ['images', 'category', 'store'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findTrending() {
    return this.productRepo.find({
      where: { isActive: true },
      relations: ['images', 'category', 'store'],
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async getFeed(userId?: string, limit = 20) {
    const trending = await this.productRepo.find({
      where: { isActive: true },
      relations: ['images', 'category', 'store'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    if (!userId) {
      return {
        personalized: false,
        products: trending.slice(0, limit),
        section: 'trending',
      };
    }

    const preferredCategories = await this.dataSource
      .createQueryBuilder()
      .select('p.category_id', 'categoryId')
      .addSelect('COUNT(DISTINCT oi.product_id)', 'orderCount')
      .from('order_items', 'oi')
      .innerJoin('orders', 'o', 'o.id = oi.order_id')
      .innerJoin('products', 'p', 'p.id = oi.product_id')
      .where('o.user_id = :userId', { userId })
      .groupBy('p.category_id')
      .orderBy('COUNT(DISTINCT oi.product_id)', 'DESC')
      .limit(5)
      .getRawMany();

    const categoryIds = preferredCategories.map((c: any) => c.categoryId);
    let personalized: Product[] = [];

    if (categoryIds.length > 0) {
      personalized = await this.productRepo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.images', 'images')
        .leftJoinAndSelect('p.category', 'category')
        .leftJoinAndSelect('p.store', 'store')
        .where('p.isActive = :isActive', { isActive: true })
        .andWhere('p.categoryId IN (:...categoryIds)', { categoryIds })
        .orderBy(`CASE p.category_id WHEN '${categoryIds[0]}' THEN 1 ELSE 2 END`, 'ASC')
        .addOrderBy('p.createdAt', 'DESC')
        .take(limit)
        .getMany();
    }

    return {
      personalized: true,
      products: personalized.length > 0 ? personalized : trending.slice(0, limit),
      section: personalized.length > 0 ? 'for-you' : 'trending',
      preferredCategories: categoryIds,
    };
  }

  async findOne(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['images', 'detail', 'category', 'store'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(userId: string, dto: CreateProductDto) {
    const store = await this.storeRepo.findOne({ where: { farmerId: userId } });
    if (!store) throw new ForbiddenException('You must create a store before adding products');

    const product = this.productRepo.create({ ...dto, storeId: store.id });
    return this.productRepo.save(product);
  }

  async update(id: string, userId: string, dto: UpdateProductDto, isAdmin: boolean) {
    const product = await this.findOne(id);
    if (product.store.farmerId !== userId && !isAdmin) {
      throw new ForbiddenException('You can only update your own products');
    }
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const product = await this.findOne(id);
    if (product.store.farmerId !== userId && !isAdmin) {
      throw new ForbiddenException('You can only delete your own products');
    }
    await this.productRepo.softDelete(id);
    return { message: 'Product deleted successfully' };
  }
}