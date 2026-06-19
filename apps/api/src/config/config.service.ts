import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

export interface AppConfig {
  platformFeePercent: number;
  minWithdrawal: number;
  minDeposit: number;
  freeDeliveryThreshold: number;
  deliveryBaseFee: number;
  referralBonus: number;
  maxUploadSizeMb: number;
  jwtAccessExpiry: string;
  jwtRefreshExpiry: string;
  otpExpirySeconds: number;
  priceAlertCheckIntervalMs: number;
  supportEmail: string;
  platformName: string;
}

const SEED_CONFIG: AppConfig = {
  platformFeePercent: 10,
  minWithdrawal: 1000,
  minDeposit: 100,
  freeDeliveryThreshold: 5000,
  deliveryBaseFee: 500,
  referralBonus: 500,
  maxUploadSizeMb: 10,
  jwtAccessExpiry: '15m',
  jwtRefreshExpiry: '7d',
  otpExpirySeconds: 300,
  priceAlertCheckIntervalMs: 60000,
  supportEmail: 'support@aisuce.com',
  platformName: 'AgriChain AI',
};

@Injectable()
export class AppConfigService {
  private config: Map<string, unknown>;

  constructor(private readonly nestConfig: NestConfigService) {
    this.config = new Map(Object.entries(SEED_CONFIG));

    this.overrideFromEnv('PLATFORM_FEE_PERCENT', 'platformFeePercent', v => Number(v));
    this.overrideFromEnv('MIN_WITHDRAWAL', 'minWithdrawal', v => Number(v));
    this.overrideFromEnv('MIN_DEPOSIT', 'minDeposit', v => Number(v));
    this.overrideFromEnv('FREE_DELIVERY_THRESHOLD', 'freeDeliveryThreshold', v => Number(v));
    this.overrideFromEnv('DELIVERY_BASE_FEE', 'deliveryBaseFee', v => Number(v));
    this.overrideFromEnv('REFERRAL_BONUS', 'referralBonus', v => Number(v));
    this.overrideFromEnv('JWT_ACCESS_EXPIRY', 'jwtAccessExpiry');
    this.overrideFromEnv('JWT_REFRESH_EXPIRY', 'jwtRefreshExpiry');
    this.overrideFromEnv('SUPPORT_EMAIL', 'supportEmail');
    this.overrideFromEnv('PLATFORM_NAME', 'platformName');
  }

  private overrideFromEnv(envKey: string, configKey: string, transform?: (v: string) => unknown): void {
    const val = this.nestConfig.get<string>(envKey);
    if (val !== undefined) {
      this.config.set(configKey, transform ? transform(val) : val);
    }
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config.get(key) as AppConfig[K];
  }

  getAll(): AppConfig {
    return Object.fromEntries(this.config) as unknown as AppConfig;
  }

  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): AppConfig[K] {
    this.config.set(key, value);
    return value;
  }
}