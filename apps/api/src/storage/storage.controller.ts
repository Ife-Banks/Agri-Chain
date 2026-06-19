import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a file (image, PDF, CSV, etc.)' })
  async uploadFile(@UploadedFile() file: UploadedFile) {
    if (!file) throw new NotFoundException('No file provided');
    return this.storageService.uploadFile(file);
  }

  @Get('files/*key')
  @ApiOperation({ summary: 'Serve a locally stored file' })
  async serveFile(
    @Param('key') key: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { path: filePath, mimeType } =
        await this.storageService.serveLocalFile(key);
      res.set({ 'Content-Type': mimeType });
      return new StreamableFile(createReadStream(filePath));
    } catch {
      throw new NotFoundException('File not found');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('files/*key')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a stored file' })
  async deleteFile(@Param('key') key: string) {
    await this.storageService.deleteFile(key);
  }
}