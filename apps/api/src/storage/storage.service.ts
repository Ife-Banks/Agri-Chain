import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export type StorageProvider = 'local' | 'cloudinary' | 's3';

@Injectable()
export class StorageService {
  private provider: StorageProvider;
  private localUploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.provider = (this.configService.get<StorageProvider>('STORAGE_PROVIDER') ?? 'local') as StorageProvider;
    this.localUploadDir = this.configService.get('UPLOAD_DIR', './uploads');

    if (this.provider === 'local' && !fs.existsSync(this.localUploadDir)) {
      fs.mkdirSync(this.localUploadDir, { recursive: true });
    }
  }

  private generateKey(originalName: string): string {
    const ext = path.extname(originalName);
    const hash = crypto.randomBytes(16).toString('hex');
    const date = new Date().toISOString().split('T')[0];
    return `${date}/${hash}${ext}`;
  }

  async uploadFile(
    file: UploadedFile,
    folder = 'general',
  ): Promise<{ key: string; url: string; size: number }> {
    const key = `${folder}/${this.generateKey(file.originalname)}`;
    if (this.provider === 'cloudinary') return this.uploadCloudinary(file, key);
    if (this.provider === 's3') return this.uploadS3(file, key);
    return this.uploadLocal(file, key);
  }

  private async uploadLocal(
    file: UploadedFile,
    key: string,
  ): Promise<{ key: string; url: string; size: number }> {
    const filePath = path.join(this.localUploadDir, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await fs.promises.writeFile(filePath, file.buffer);
    const baseUrl = this.configService.get('APP_URL', 'http://localhost:4000');
    return { key, url: `${baseUrl}/storage/files/${key}`, size: file.size };
  }

  private async uploadCloudinary(
    file: UploadedFile,
    key: string,
  ): Promise<{ key: string; url: string; size: number }> {
    let c: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod: any = require('cloudinary');
      c = (mod.v2 || mod) as any;
    } catch {
      throw new InternalServerErrorException('Cloudinary not installed. Run: pnpm add cloudinary');
    }

    c.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    return new Promise((resolve, reject) => {
      const folder = key.split('/')[0];
      const uploadStream = c.uploader.upload_stream(
        { folder, resource_type: 'auto', public_id: key },
        (error: any, result: any) => {
          if (error || !result) {
            reject(new InternalServerErrorException('Cloudinary upload failed'));
            return;
          }
          resolve({ key: result.public_id, url: result.secure_url, size: result.bytes });
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  private async uploadS3(
    file: UploadedFile,
    key: string,
  ): Promise<{ key: string; url: string; size: number }> {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

    const client = new S3Client({
      region: this.configService.get<string>('AWS_REGION')!,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });

    await client.send(
      new PutObjectCommand({
        Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    return { key, url: `https://${bucket}.s3.amazonaws.com/${key}`, size: file.size };
  }

  private resolveSafePath(key: string): string {
    const base = path.resolve(this.localUploadDir);
    const resolved = path.resolve(base, key);
    if (!resolved.startsWith(base)) {
      throw new BadRequestException('Invalid file path');
    }
    return resolved;
  }

  async deleteFile(key: string): Promise<void> {
    if (this.provider === 'cloudinary') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod: any = require('cloudinary');
      const c: any = (mod.v2 || mod);
      c.config({
        cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
        api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
        api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
      });
      await c.uploader.destroy(key);
      return;
    }

    if (this.provider === 's3') {
      const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      const client = new S3Client({});
      await client.send(
        new DeleteObjectCommand({
          Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
          Key: key,
        }),
      );
      return;
    }

    const filePath = this.resolveSafePath(key);
    if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
  }

  async serveLocalFile(key: string): Promise<{ path: string; mimeType: string }> {
    const filePath = this.resolveSafePath(key);
    if (!fs.existsSync(filePath)) throw new BadRequestException('File not found');
    const ext = path.extname(key).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.gif': 'image/gif', '.webp': 'image/webp', '.pdf': 'application/pdf',
      '.csv': 'text/csv', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return { path: filePath, mimeType: mimeTypes[ext] || 'application/octet-stream' };
  }
}