import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { TransactionType, TransactionStatus } from './entities/transaction.enum';
import { QrToken } from './entities/qr-token.entity';
import { BankBeneficiary } from './entities/bank-beneficiary.entity';
import {
  DepositDto,
  WithdrawDto,
  TransferDto,
  GenerateQrDto,
  SetBankAccountDto,
  AddBeneficiaryDto,
  SetPinDto,
  FreezeWalletDto,
  TransactionQueryDto,
} from './dto/wallet.dto';

const PIN_HASH_ROUNDS = 10;

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly txRepo: Repository<WalletTransaction>,
    @InjectRepository(QrToken)
    private readonly qrRepo: Repository<QrToken>,
    @InjectRepository(BankBeneficiary)
    private readonly beneficiaryRepo: Repository<BankBeneficiary>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Wallet Access ──────────────────────────────────────────────────────

  private async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepo.findOne({ where: { userId } });
    if (!wallet) {
      wallet = this.walletRepo.create({ userId, balance: 0 });
      wallet = await this.walletRepo.save(wallet);
    }
    return wallet;
  }

  async getWallet(userId: string): Promise<Wallet> {
    return this.getOrCreateWallet(userId);
  }

  async getWalletById(id: string): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({ where: { id } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  // ─── Deposit ────────────────────────────────────────────────────────────

  async deposit(userId: string, dto: DepositDto): Promise<WalletTransaction> {
    const wallet = await this.getOrCreateWallet(userId);

    if (dto.idempotencyKey) {
      const existing = await this.txRepo.findOne({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) {
        return existing;
      }
    }

    if (wallet.isFrozen) {
      throw new ForbiddenException('Wallet is frozen. Unfreeze to deposit.');
    }

    const newBalance = Number(wallet.balance) + dto.amount;
    wallet.balance = newBalance;
    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({
      walletId: wallet.id,
      type: TransactionType.DEPOSIT,
      amount: dto.amount,
      fee: 0,
      balanceAfter: newBalance,
      status: TransactionStatus.COMPLETED,
      idempotencyKey: dto.idempotencyKey || crypto.randomUUID(),
      metadata: dto.metadata || {},
    });

    return this.txRepo.save(tx);
  }

  // ─── Withdraw ───────────────────────────────────────────────────────────

  async withdraw(userId: string, dto: WithdrawDto): Promise<WalletTransaction> {
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.isFrozen) {
      throw new ForbiddenException('Wallet is frozen. Unfreeze to withdraw.');
    }

    if (!wallet.pinHash) {
      throw new BadRequestException('Wallet PIN not set. Set PIN before withdrawing.');
    }

    if (Number(wallet.balance) < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    if (dto.idempotencyKey) {
      const existing = await this.txRepo.findOne({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) return existing;
    }

    const newBalance = Number(wallet.balance) - dto.amount;
    wallet.balance = newBalance;
    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({
      walletId: wallet.id,
      type: TransactionType.WITHDRAWAL,
      amount: dto.amount,
      fee: 0,
      balanceAfter: newBalance,
      status: TransactionStatus.COMPLETED,
      idempotencyKey: dto.idempotencyKey || crypto.randomUUID(),
      metadata: { bank: dto.bank, accountNumber: dto.accountNumber, accountName: dto.accountName },
    });

    return this.txRepo.save(tx);
  }

  // ─── Transfer ─────────────────────────────────────────────────────────────

  async transfer(userId: string, dto: TransferDto): Promise<WalletTransaction> {
    if (!dto.idempotencyKey) {
      dto.idempotencyKey = crypto.randomUUID();
    }

    const existing = await this.txRepo.findOne({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existing) return existing;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const senderWallet = await queryRunner.manager
        .createQueryBuilder(Wallet, 'w')
        .setLock('pessimistic_write')
        .where('w.userId = :userId', { userId })
        .getOne();

      if (!senderWallet) throw new NotFoundException('Sender wallet not found');
      if (senderWallet.isFrozen) throw new ForbiddenException('Wallet is frozen');
      if (Number(senderWallet.balance) < dto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const recipientWallet = await queryRunner.manager.findOne(Wallet, {
        where: { id: dto.recipientWalletId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!recipientWallet) throw new NotFoundException('Recipient wallet not found');
      if (recipientWallet.isFrozen) throw new ForbiddenException('Recipient wallet is frozen');
      if (senderWallet.id === recipientWallet.id) {
        throw new BadRequestException('Cannot transfer to yourself');
      }

      const senderNewBalance = Number(senderWallet.balance) - dto.amount;
      const recipientNewBalance = Number(recipientWallet.balance) + dto.amount;

      senderWallet.balance = senderNewBalance;
      recipientWallet.balance = recipientNewBalance;

      await queryRunner.manager.save([senderWallet, recipientWallet]);

      const debitTx = queryRunner.manager.create(WalletTransaction, {
        walletId: senderWallet.id,
        type: TransactionType.TRANSFER_OUT,
        amount: dto.amount,
        fee: 0,
        balanceAfter: senderNewBalance,
        status: TransactionStatus.COMPLETED,
        counterpartWalletId: recipientWallet.id,
        idempotencyKey: dto.idempotencyKey + '_debit',
        metadata: { note: dto.note },
      });
      await queryRunner.manager.save(debitTx);

      const creditTx = queryRunner.manager.create(WalletTransaction, {
        walletId: recipientWallet.id,
        type: TransactionType.TRANSFER_IN,
        amount: dto.amount,
        fee: 0,
        balanceAfter: recipientNewBalance,
        status: TransactionStatus.COMPLETED,
        counterpartWalletId: senderWallet.id,
        idempotencyKey: dto.idempotencyKey + '_credit',
        metadata: { note: dto.note },
      });
      await queryRunner.manager.save(creditTx);

      await queryRunner.commitTransaction();
      return debitTx;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ─── Transactions ─────────────────────────────────────────────────────────

  async getTransactions(
    userId: string,
    query: TransactionQueryDto,
  ): Promise<{ data: WalletTransaction[]; total: number; page: number; limit: number }> {
    const wallet = await this.getOrCreateWallet(userId);
    const { page = 1, limit = 20, type, order = 'DESC' } = query;

    const where: Record<string, unknown> = { walletId: wallet.id };
    if (type) where.type = type;

    const [data, total] = await this.txRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: order },
    });

    return { data, total, page, limit };
  }

  // ─── QR Code ─────────────────────────────────────────────────────────────

  async generateQrToken(userId: string, dto: GenerateQrDto): Promise<QrToken> {
    const wallet = await this.getOrCreateWallet(userId);
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (dto.expiresInMinutes ?? 15));

    const qrToken = this.qrRepo.create({
      walletId: wallet.id,
      tokenHash,
      amount: dto.amount ?? undefined,
      expiresAt,
    });

    return this.qrRepo.save(qrToken);
  }

  async validateQrToken(
    token: string,
    amount?: number,
  ): Promise<{ success: boolean; walletId: string; amount: number }> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const qrToken = await this.qrRepo.findOne({
      where: { tokenHash },
      relations: ['wallet'],
    });

    if (!qrToken) throw new NotFoundException('Invalid QR token');
    if (qrToken.usedAt) throw new BadRequestException('QR token already used');
    if (new Date(qrToken.expiresAt) < new Date()) throw new BadRequestException('QR token has expired');
    if (qrToken.wallet.isFrozen) throw new ForbiddenException('Recipient wallet is frozen');

    if (qrToken.amount && amount && amount !== Number(qrToken.amount)) {
      throw new BadRequestException(`QR code is for ₦${qrToken.amount} only`);
    }

    qrToken.usedAt = new Date();
    await this.qrRepo.save(qrToken);

    return {
      success: true,
      walletId: qrToken.walletId,
      amount: qrToken.amount ? Number(qrToken.amount) : (amount ?? 0),
    };
  }

  // ─── Bank Account ─────────────────────────────────────────────────────────

  async setBankAccount(userId: string, dto: SetBankAccountDto): Promise<Wallet> {
    const wallet = await this.getOrCreateWallet(userId);
    wallet.bank = dto.bank;
    wallet.accountNumber = dto.accountNumber;
    wallet.accountName = dto.accountName;
    return this.walletRepo.save(wallet);
  }

  // ─── Beneficiaries ───────────────────────────────────────────────────────

  async addBeneficiary(userId: string, dto: AddBeneficiaryDto): Promise<BankBeneficiary> {
    const wallet = await this.getOrCreateWallet(userId);
    const beneficiary = this.beneficiaryRepo.create({ ...dto, walletId: wallet.id });
    return this.beneficiaryRepo.save(beneficiary);
  }

  async getBeneficiaries(userId: string): Promise<BankBeneficiary[]> {
    const wallet = await this.getOrCreateWallet(userId);
    return this.beneficiaryRepo.find({ where: { walletId: wallet.id } });
  }

  async removeBeneficiary(userId: string, beneficiaryId: string): Promise<void> {
    const wallet = await this.getOrCreateWallet(userId);
    const beneficiary = await this.beneficiaryRepo.findOne({
      where: { id: beneficiaryId, walletId: wallet.id },
    });
    if (!beneficiary) throw new NotFoundException('Beneficiary not found');
    await this.beneficiaryRepo.remove(beneficiary);
  }

  // ─── PIN ──────────────────────────────────────────────────────────────────

  async setPin(userId: string, dto: SetPinDto): Promise<{ message: string }> {
    const wallet = await this.getOrCreateWallet(userId);
    wallet.pinHash = await bcrypt.hash(dto.pin, PIN_HASH_ROUNDS);
    await this.walletRepo.save(wallet);
    return { message: 'PIN set successfully' };
  }

  async verifyPin(userId: string, pin: string): Promise<boolean> {
    const wallet = await this.getOrCreateWallet(userId);
    if (!wallet.pinHash) return false;
    return bcrypt.compare(pin, wallet.pinHash);
  }

  // ─── Freeze / Unfreeze ───────────────────────────────────────────────────

  async toggleFreeze(userId: string, dto: FreezeWalletDto): Promise<Wallet> {
    const wallet = await this.getOrCreateWallet(userId);

    if (!wallet.pinHash) {
      throw new BadRequestException('PIN must be set before freezing');
    }

    const valid = await bcrypt.compare(dto.pin, wallet.pinHash);
    if (!valid) throw new ForbiddenException('Invalid PIN');

    wallet.isFrozen = dto.freeze;
    return this.walletRepo.save(wallet);
  }

  // ─── Paystack Webhook ───────────────────────────────────────────────────

  verifyPaystackWebhook(
    body: Record<string, unknown>,
    signature: string,
    secret: string,
  ): string {
    const computed = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (computed !== signature) {
      throw new BadRequestException('Invalid Paystack signature');
    }

    return (body.event as string) ?? 'unknown';
  }
}