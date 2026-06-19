import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PinGuard } from '../auth/guards/pin.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import {
  DepositDto,
  WithdrawDto,
  TransferDto,
  GenerateQrDto,
  SetBankAccountDto,
  AddBeneficiaryDto,
  SetPinDto,
  VerifyPinDto,
  FreezeWalletDto,
  TransactionQueryDto,
} from './dto/wallet.dto';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user wallet with balance' })
  async getWallet(@CurrentUser('sub') userId: string) {
    return this.walletService.getWallet(userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history (paginated)' })
  async getTransactions(
    @CurrentUser('sub') userId: string,
    @Query() query: TransactionQueryDto,
  ) {
    return this.walletService.getTransactions(userId, query);
  }

  @Get('beneficiaries')
  @ApiOperation({ summary: 'List saved bank beneficiaries' })
  async getBeneficiaries(@CurrentUser('sub') userId: string) {
    return this.walletService.getBeneficiaries(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get wallet by ID (admin only)' })
  async getWalletById(@Param('id') id: string) {
    return this.walletService.getWalletById(id);
  }

  @Post('deposit/webhook')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary: 'Paystack webhook — called by Paystack on successful payment',
    description: 'Verify Paystack signature, credit wallet. Do not call directly.',
  })
  async paystackWebhook(
    @Body() body: Record<string, unknown>,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret || secret === 'your-paystack-secret-key') {
      throw new UnauthorizedException('Paystack not configured');
    }
    const event = this.walletService.verifyPaystackWebhook(body, signature, secret);
    if (event === 'charge.success') {
      const data = body.data as Record<string, unknown>;
      const amount = (Number(data.amount) / 100);
      const reference = data.reference as string;
      const userId = data.metadata?.['userId'] as string;
      if (userId) {
        await this.walletService.deposit(userId, {
          amount,
          idempotencyKey: reference,
          metadata: { source: 'paystack', reference },
        });
      }
    }
    return { status: 'received' };
  }

  @Post('deposit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Deposit funds (manual — for testing or internal use)' })
  async deposit(@CurrentUser('sub') userId: string, @Body() dto: DepositDto) {
    return this.walletService.deposit(userId, dto);
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PinGuard)
  @ApiOperation({ summary: 'Withdraw funds to bank account (requires PIN in X-PIN header)' })
  async withdraw(@CurrentUser('sub') userId: string, @Body() dto: WithdrawDto) {
    return this.walletService.withdraw(userId, dto);
  }

  @Post('transfer')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PinGuard)
  @ApiOperation({ summary: 'Transfer funds to another wallet (requires PIN in X-PIN header)' })
  async transfer(@CurrentUser('sub') userId: string, @Body() dto: TransferDto) {
    return this.walletService.transfer(userId, dto);
  }

  @Post('qr/generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate QR token for receiving payments' })
  async generateQr(@CurrentUser('sub') userId: string, @Body() dto: GenerateQrDto) {
    return this.walletService.generateQrToken(userId, dto);
  }

  @Post('qr/validate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Validate QR token and credit recipient wallet (authenticated cashier app)',
    description: "Business app scans user's QR code and calls this to credit the recipient. Requires cashier JWT.",
  })
  async validateQr(@Body() body: { token: string; amount?: number }) {
    return this.walletService.validateQrToken(body.token, body.amount);
  }

  @Post('bank')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set default bank account for withdrawals' })
  async setBankAccount(@CurrentUser('sub') userId: string, @Body() dto: SetBankAccountDto) {
    return this.walletService.setBankAccount(userId, dto);
  }

  @Post('beneficiaries')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a bank beneficiary' })
  async addBeneficiary(@CurrentUser('sub') userId: string, @Body() dto: AddBeneficiaryDto) {
    return this.walletService.addBeneficiary(userId, dto);
  }

  @Delete('beneficiaries/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a saved beneficiary' })
  async removeBeneficiary(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    await this.walletService.removeBeneficiary(userId, id);
  }

  @Post('pin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set or change wallet PIN' })
  async setPin(@CurrentUser('sub') userId: string, @Body() dto: SetPinDto) {
    return this.walletService.setPin(userId, dto);
  }

  @Post('verify-pin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify wallet PIN' })
  async verifyPin(@CurrentUser('sub') userId: string, @Body() dto: VerifyPinDto) {
    const valid = await this.walletService.verifyPin(userId, dto.pin);
    return { valid };
  }

  @Post('freeze')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PinGuard)
  @ApiOperation({ summary: 'Freeze or unfreeze wallet (requires PIN in X-PIN header)' })
  async toggleFreeze(@CurrentUser('sub') userId: string, @Body() dto: FreezeWalletDto) {
    return this.walletService.toggleFreeze(userId, dto);
  }
}