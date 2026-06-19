import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsOrder, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  UpdateRolesDto,
  UserQueryDto,
  UserRoleFilter,
} from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ─── Admin: Create User ─────────────────────────────────────────────────

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });
    if (existing) {
      throw new BadRequestException('Email or username already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      phoneNumber: dto.phone,
      username: dto.username,
      passwordHash,
      isFarmer: dto.role === 'farmer',
      isAgricEnterprise: dto.role === 'agric_enterprise',
      isFarmCustomer: dto.role === 'buyer',
      isAdmin: dto.role === 'admin',
    });

    return this.userRepo.save(user);
  }

  // ─── Admin: List Users (paginated + filtered) ───────────────────────────

  async findAll(query: UserQueryDto): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search, role, sortBy = 'createdAt', order = 'DESC' } = query;

    const where: FindOptionsWhere<User> = {};

    if (search) {
      where.email = ILike(`%${search}%`);
    }

    if (role && role !== UserRoleFilter.ALL) {
      switch (role) {
        case UserRoleFilter.ADMIN:
          where.isAdmin = true;
          break;
        case UserRoleFilter.FARMER:
          where.isFarmer = true;
          break;
        case UserRoleFilter.BUYER:
          where.isFarmCustomer = true;
          break;
        case UserRoleFilter.AGRIC_ENTERPRISE:
          where.isAgricEnterprise = true;
          break;
      }
    }

    const orderObj: FindOptionsOrder<User> = {
      [sortBy]: order,
    } as FindOptionsOrder<User>;

    const [data, total] = await this.userRepo.findAndCount({
      where,
      order: orderObj,
      skip: (page - 1) * limit,
      take: limit,
      select: [
        'id',
        'email',
        'phoneNumber',
        'username',
        'isAdmin',
        'isFarmer',
        'isAgricEnterprise',
        'isFarmCustomer',
        'createdAt',
        'updatedAt',
      ],
    });

    return { data, total, page, limit };
  }

  // ─── Admin: Get Single User ─────────────────────────────────────────────

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['stores', 'orders'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // ─── Admin: Get User by Email ───────────────────────────────────────────

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  // ─── Self / Admin: Update User Profile ──────────────────────────────────

  async update(id: string, dto: UpdateUserDto, actorId: string, actorRoles: string[]): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const isSelf = actorId === id;
    const isAdmin = actorRoles.includes('admin');

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // Non-admins cannot set isActive
    if (dto.isActive !== undefined && !isAdmin) {
      throw new ForbiddenException('Only admins can activate/deactivate accounts');
    }

    if (dto.username) user.username = dto.username;
    if (dto.phone) user.phoneNumber = dto.phone;
    if (dto.avatarUrl !== undefined) {
      Object.assign(user, { avatarUrl: dto.avatarUrl });
    }

    return this.userRepo.save(user);
  }

  // ─── Self: Change Password ──────────────────────────────────────────────

  async changePassword(id: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(user);

    return { message: 'Password changed successfully' };
  }

  // ─── Admin: Update User Roles ───────────────────────────────────────────

  async updateRoles(id: string, dto: UpdateRolesDto, actorId: string, actorRoles: string[]): Promise<User> {
    const isAdmin = actorRoles.includes('admin');
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can update user roles');
    }

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (dto.isAdmin !== undefined) user.isAdmin = dto.isAdmin;
    if (dto.isFarmer !== undefined) user.isFarmer = dto.isFarmer;
    if (dto.isAgricEnterprise !== undefined) user.isAgricEnterprise = dto.isAgricEnterprise;
    if (dto.isFarmCustomer !== undefined) user.isFarmCustomer = dto.isFarmCustomer;

    return this.userRepo.save(user);
  }

  // ─── Admin: Soft Delete User ─────────────────────────────────────────────

  async remove(id: string, actorId: string, actorRoles: string[]): Promise<{ message: string }> {
    const isAdmin = actorRoles.includes('admin');
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can delete users');
    }

    if (id === actorId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepo.softRemove(user);
    return { message: 'User deleted successfully' };
  }

  // ─── Count Users by Role ────────────────────────────────────────────────

  async countByRole(): Promise<{ admins: number; farmers: number; buyers: number; enterprises: number; total: number }> {
    const [admins, farmers, buyers, enterprises, total] = await Promise.all([
      this.userRepo.count({ where: { isAdmin: true } }),
      this.userRepo.count({ where: { isFarmer: true } }),
      this.userRepo.count({ where: { isFarmCustomer: true } }),
      this.userRepo.count({ where: { isAgricEnterprise: true } }),
      this.userRepo.count({}),
    ]);
    return { admins, farmers, buyers, enterprises, total };
  }
}