import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  password: z.string().min(8),
});
export type LoginDto = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  username: z.string().min(3).max(100),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
  role: z.enum(["farmer", "buyer", "agric_enterprise"]),
});
export type RegisterDto = z.infer<typeof RegisterSchema>;

export const PinSchema = z.object({
  pin: z.string().length(4).regex(/^\d{4}$/),
});
export type PinDto = z.infer<typeof PinSchema>;

export const CreateProductSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(20).max(1000),
  categoryId: z.string().uuid(),
  price: z.number().positive().max(9999999),
  kilogram: z.number().positive(),
  stock: z.number().positive().int(),
  condition: z.enum(["Fresh", "Dried", "Processed"]),
});
export type CreateProductDto = z.infer<typeof CreateProductSchema>;

export const AddCartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
});
export type AddCartItemDto = z.infer<typeof AddCartItemSchema>;

export const CreateOrderSchema = z.object({
  addressId: z.string().uuid(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["wallet", "paystack"]),
});
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;

export const WalletTransferSchema = z.object({
  type: z.enum(["GP", "BANK", "PHONE", "QR"]),
  amount: z.number().positive(),
  target: z.string(),
  idempotencyKey: z.string().uuid(),
});
export type WalletTransferDto = z.infer<typeof WalletTransferSchema>;

export const WalletDepositSchema = z.object({
  amount: z.number().positive().max(10000000),
});
export type WalletDepositDto = z.infer<typeof WalletDepositSchema>;

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type PaginationDto = z.infer<typeof PaginationSchema>;

export const CreatePriceAlertSchema = z.object({
  commodityId: z.string().uuid(),
  thresholdType: z.enum(["ABOVE", "BELOW"]),
  thresholdPrice: z.number().positive(),
});
export type CreatePriceAlertDto = z.infer<typeof CreatePriceAlertSchema>;
