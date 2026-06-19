import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateAddressDto, UpdateAddressDto } from './dto/addresses.dto';

@ApiTags('Addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new delivery address' })
  async create(@CurrentUser('sub') userId: string, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all your addresses' })
  async findAll(@CurrentUser('sub') userId: string) {
    return this.addressesService.findAllForUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific address' })
  async findOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.addressesService.findOne(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an address' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, userId, dto);
  }

  @Patch(':id/default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set an address as the default delivery address' })
  async setDefault(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.addressesService.setDefault(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an address' })
  async remove(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    await this.addressesService.remove(id, userId);
  }
}