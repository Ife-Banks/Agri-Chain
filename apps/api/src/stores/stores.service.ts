import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere, Not } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto, UpdateStoreDto, StoreQueryDto } from './dto/stores.dto';
import { slugify } from '../common/utils/slugify';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
  ) {}

  // ─── Farmer: Create Store ───────────────────────────────────────────────

  async create(farmerId: string, dto: CreateStoreDto): Promise<Store> {
    const existing = await this.storeRepo.findOne({ where: { farmerId } });
    if (existing) {
      throw new BadRequestException('You already have a store. Use PUT to update it.');
    }

    const baseSlug = slugify(dto.name);
    let slug = baseSlug;
    let counter = 1;

    while (await this.storeRepo.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const store = this.storeRepo.create({
      ...dto,
      farmerId,
      slug,
    });

    return this.storeRepo.save(store);
  }

  // ─── Public: List Stores ──────────────────────────────────────────────────

  async findAll(
    query: StoreQueryDto,
  ): Promise<{ data: Store[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search, order = 'DESC' } = query;

    const where: FindOptionsWhere<Store> = { isActive: true };
    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const [data, total] = await this.storeRepo.findAndCount({
      where,
      relations: ['farmer'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: order },
    });

    return { data, total, page, limit };
  }

  // ─── Public: Get Store by ID ─────────────────────────────────────────────

  async findOne(id: string): Promise<Store> {
    const store = await this.storeRepo.findOne({
      where: { id },
      relations: ['farmer', 'products'],
    });
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return store;
  }

  // ─── Public: Get Store by Slug ───────────────────────────────────────────

  async findBySlug(slug: string): Promise<Store> {
    const store = await this.storeRepo.findOne({
      where: { slug },
      relations: ['farmer', 'products'],
    });
    if (!store || !store.isActive) {
      throw new NotFoundException(`Store "${slug}" not found`);
    }
    return store;
  }

  // ─── Auth: Get Store by Farmer ID ────────────────────────────────────────

  async findByFarmer(farmerId: string): Promise<Store> {
    const store = await this.storeRepo.findOne({
      where: { farmerId },
      relations: ['farmer'],
    });
    if (!store) {
      throw new NotFoundException('You do not have a store yet');
    }
    return store;
  }

  // ─── Authenticated: Update Store ─────────────────────────────────────────

  async update(
    id: string,
    dto: UpdateStoreDto,
    actorId: string,
    actorRoles: string[],
  ): Promise<Store> {
    const store = await this.storeRepo.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    const isOwner = store.farmerId === actorId;
    const isAdmin = actorRoles.includes('admin');

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only update your own store');
    }

    if (dto.name && dto.name !== store.name) {
      const baseSlug = slugify(dto.name);
      let slug = baseSlug;
      let counter = 1;
      while (await this.storeRepo.findOne({ where: { slug, id: Not(id) } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      store.slug = slug;
    }

    Object.assign(store, dto);
    return this.storeRepo.save(store);
  }

  // ─── Admin: Toggle Verification ───────────────────────────────────────────

  async toggleVerification(id: string, actorRoles: string[]): Promise<Store> {
    if (!actorRoles.includes('admin')) {
      throw new ForbiddenException('Admin access required');
    }

    const store = await this.storeRepo.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    store.isVerified = !store.isVerified;
    return this.storeRepo.save(store);
  }

  // ─── Admin: Soft Delete Store ────────────────────────────────────────────

  async remove(id: string, actorRoles: string[]): Promise<{ message: string }> {
    if (!actorRoles.includes('admin')) {
      throw new ForbiddenException('Admin access required');
    }

    const store = await this.storeRepo.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    await this.storeRepo.softRemove(store);
    return { message: 'Store deleted successfully' };
  }
}