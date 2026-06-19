import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import {
  DetectDiseaseDto,
  PricePredictionDto,
  CropRecommendationDto,
  MarketInsightDto,
  ChatMessageDto,
} from './dto/ai.dto';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('detect-disease')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Detect plant disease from leaf image',
    description: 'Upload a photo of a plant leaf for AI-powered disease detection and treatment recommendations',
  })
  async detectDisease(
    @UploadedFile() file: any,
    @Body() dto: DetectDiseaseDto,
  ) {
    const buffer = file?.buffer ?? Buffer.from([]);
    return this.aiService.detectDisease(buffer, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('price-prediction')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get price prediction for a commodity',
    description: 'AI-powered price forecasting using time-series analysis (30-day default horizon)',
  })
  async predictPrice(@Body() dto: PricePredictionDto) {
    return this.aiService.predictPrice(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('crop-recommendation')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get AI crop recommendations for your farm',
    description: 'Personalized crop recommendations based on location, soil type, budget, and current market data',
  })
  async getCropRecommendation(@Body() dto: CropRecommendationDto) {
    return this.aiService.recommendCrops(dto);
  }

  @Public()
  @Get('market-insights')
  @ApiOperation({
    summary: 'Get AI-generated market insights and price trend analysis',
    description: 'Summarized commodity market intelligence with price movements and 2-week outlook',
  })
  async getMarketInsights(@Body() dto: MarketInsightDto) {
    return this.aiService.getMarketInsights(dto);
  }

  @Public()
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Chat with the AI farming assistant',
    description: 'FAQ assistant for fertilizer advice, disease management, planting schedules, market access, and financing',
  })
  async chat(@Body() dto: ChatMessageDto) {
    return this.aiService.chatWithAssistant(dto);
  }
}