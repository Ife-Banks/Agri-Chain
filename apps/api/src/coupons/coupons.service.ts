import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Coupon, CouponDiscountType } from './coupon.entity';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto, CouponQueryDto } from './dto/coupons.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,
  ) {}

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const existing = await this.couponRepo.findOne({
      where: { code: ILike(dto.code) },
    });
    if (existing) {
      throw new ConflictException(`Coupon code "${dto.code}" already exists`);
    }

    const coupon = this.couponRepo.create({
      ...dto,
      code: dto.code.toUpperCase(),
    });
    return this.couponRepo.save(coupon);
  }

  async findAll(
    query: CouponQueryDto,
  ): Promise<{ data: Coupon[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search } = query;

    const where = search
      ? { code: ILike(`%${search}%`) }
      : {};

    const [data, total] = await this.couponRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return coupon;
  }

  async validate(dto: ValidateCouponDto): Promise<{
    valid: boolean;
    discount: number;
    coupon: Coupon;
  }> {
    const coupon = await this.couponRepo.findOne({
      where: { code: ILike(dto.code) },
    });

    if (!coupon) {
      throw new NotFoundException('Invalid coupon code');
    }

    const now = new Date();
    if (coupon.expiry && new Date(coupon.expiry) < now) {
      throw new BadRequestException('This coupon has expired');
    }

    if (coupon.usesRemaining !== null && coupon.usesRemaining <= 0) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }

    if (coupon.minOrder && dto.orderAmount < Number(coupon.minOrder)) {
      throw new BadRequestException(
        `Minimum order of ₦${coupon.minOrder} required to use this coupon`,
      );
    }

    let discount: number;
    if (coupon.discountType === CouponDiscountType.PERCENTAGE) {
      discount = Number((dto.orderAmount * Number(coupon.value)) / 100);
    } else {
      discount = Number(coupon.value);
      if (discount > dto.orderAmount) {
        discount = dto.orderAmount;
      }
    }

    return { valid: true, discount, coupon };
  }

  async decrementUses(id: string): Promise<void> {
    await this.couponRepo.decrement({ id }, 'usesRemaining', 1);
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findOne(id);

    if (dto.code && dto.code.toUpperCase() !== coupon.code) {
      const existing = await this.couponRepo.findOne({
        where: { code: ILike(dto.code) },
      });
      if (existing) {
        throw new ConflictException(`Coupon code "${dto.code}" already exists`);
      }
    }

    Object.assign(coupon, {
      ...dto,
      code: dto.code?.toUpperCase(),
    });
    return this.couponRepo.save(coupon);
  }

  async remove(id: string): Promise<void> {
    const coupon = await this.findOne(id);
    await this.couponRepo.remove(coupon);
  }
}