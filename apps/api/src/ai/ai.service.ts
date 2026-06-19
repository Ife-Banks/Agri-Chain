import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commodity } from '../markets/entities/commodity.entity';
import { CommodityPrice } from '../markets/entities/commodity-price.entity';
import {
  DetectDiseaseDto,
  DiseaseDetectionResult,
  PricePredictionDto,
  PricePredictionResult,
  CropRecommendationDto,
  CropRecommendation,
  MarketInsightDto,
  MarketInsight,
  ChatMessageDto,
  ChatResponse,
} from './dto/ai.dto';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(Commodity)
    private readonly commodityRepo: Repository<Commodity>,
    @InjectRepository(CommodityPrice)
    private readonly priceRepo: Repository<CommodityPrice>,
  ) {}

  async detectDisease(
    imageBuffer: Buffer,
    dto: DetectDiseaseDto,
  ): Promise<DiseaseDetectionResult> {
    // ─── Real integration point ───────────────────────────────────────────
    // Replace with actual ML model inference (TensorFlow.js, PyTorch, etc.)
    // const result = await this.mlService.classifyPlantDisease(imageBuffer);
    // ─────────────────────────────────────────────────────────────────────

    const commonDiseases = [
      {
        disease: 'Late Blight',
        confidence: 0.87,
        recommendation:
          'Apply copper-based fungicide immediately. Remove and destroy infected plants to prevent spread. Ensure good air circulation around remaining plants.',
        isContagious: true,
      },
      {
        disease: 'Powdery Mildew',
        confidence: 0.79,
        recommendation:
          'Apply sulfur-based fungicide or neem oil spray. Reduce humidity around plants. Remove heavily infected leaves.',
        isContagious: true,
      },
      {
        disease: 'Bacterial Wilt',
        confidence: 0.72,
        recommendation:
          'No effective chemical treatment. Remove infected plants immediately and sterilize soil. Rotate crops for 2-3 seasons.',
        isContagious: true,
      },
      {
        disease: 'Maize Lethal Necrosis',
        confidence: 0.91,
        recommendation:
          'Roguing of infected plants required. Use certified disease-free seeds. Apply balanced NPK fertilizers. Control aphids as virus vectors.',
        isContagious: true,
      },
      {
        disease: 'Cassava Mosaic Virus',
        confidence: 0.88,
        recommendation:
          'Use resistant varieties (e.g., TMS 30572). Remove infected plants early. Control whitefly vectors with appropriate insecticides.',
        isContagious: true,
      },
    ];

    const text = [dto.symptoms, dto.location].filter(Boolean).join(' ').toLowerCase();

    let match = commonDiseases[0];
    if (text.includes('yellow') || text.includes('chlorosis')) {
      match = commonDiseases[1];
    } else if (text.includes('wilt') || text.includes('bacterial')) {
      match = commonDiseases[2];
    } else if (text.includes('maize') || text.includes('corn')) {
      match = commonDiseases[3];
    } else if (text.includes('cassava')) {
      match = commonDiseases[4];
    }

    return match;
  }

  async predictPrice(dto: PricePredictionDto): Promise<PricePredictionResult> {
    const commodity = await this.commodityRepo.findOne({
      where: { id: dto.commodityId },
    });
    if (!commodity) {
      throw new Error(`Commodity ${dto.commodityId} not found`);
    }

    const latestPrice = await this.priceRepo.findOne({
      where: { commodityId: dto.commodityId },
      order: { recordedAt: 'DESC' },
    });

    const currentPrice = latestPrice ? Number(latestPrice.price) : 10000;
    const daysAhead = dto.daysAhead ?? 30;

    // ─── Real integration point ───────────────────────────────────────────
    // Replace with time-series forecasting model (Prophet, ARIMA, LSTM)
    // const prediction = await this.forecastService.predict(commodityId, daysAhead);
    // ─────────────────────────────────────────────────────────────────────

    const volatilityFactor = 1 + (Math.random() * 0.1 - 0.05);
    const trend = currentPrice > 10000 ? 1.05 : 0.97;
    const predictedPrice = Math.round(currentPrice * trend * volatilityFactor);
    const predictedChangePercent = Number(
      (((predictedPrice - currentPrice) / currentPrice) * 100).toFixed(1),
    );

    return {
      commodityId: dto.commodityId,
      commodityName: commodity.name,
      currentPrice,
      predictedPrice,
      daysAhead,
      predictedChangePercent,
      trend: predictedChangePercent > 0 ? 'upward' : 'downward',
    };
  }

  async recommendCrops(dto: CropRecommendationDto): Promise<CropRecommendation[]> {
    // ─── Real integration point ───────────────────────────────────────────
    // Replace with crop recommendation ML model using soil data, climate, market prices
    // const recommendations = await this.mlService.getCropRecommendations(dto);
    // ─────────────────────────────────────────────────────────────────────

    const cropDatabase: CropRecommendation[] = [
      {
        crop: 'Maize',
        reason: 'High demand year-round in Nigeria, drought-tolerant varieties available',
        bestPlantingSeason: 'June - July (early rain)',
        expectedYieldDays: 90,
        estimatedRevenue: 180000,
        riskLevel: 'low',
      },
      {
        crop: 'Cassava',
        reason: 'Low input cost, excellent storage tolerance, strong market demand',
        bestPlantingSeason: 'April - June',
        expectedYieldDays: 365,
        estimatedRevenue: 250000,
        riskLevel: 'low',
      },
      {
        crop: 'Tomato',
        reason: 'Short growing cycle, high profit margin in dry season with irrigation',
        bestPlantingSeason: 'October - November',
        expectedYieldDays: 75,
        estimatedRevenue: 320000,
        riskLevel: 'medium',
      },
      {
        crop: 'Rice',
        reason: 'Government incentives, guaranteed off-take via anchor borrower program',
        bestPlantingSeason: 'June - July',
        expectedYieldDays: 120,
        estimatedRevenue: 210000,
        riskLevel: 'low',
      },
      {
        crop: 'Soybean',
        reason: 'Improves soil nitrogen, short cycle, good export market and livestock feed demand',
        bestPlantingSeason: 'July - August',
        expectedYieldDays: 90,
        estimatedRevenue: 145000,
        riskLevel: 'low',
      },
      {
        crop: 'Pepper (Scotch Bonnet)',
        reason: 'High export demand, long shelf life when dried, premium price in dry season',
        bestPlantingSeason: 'March - May',
        expectedYieldDays: 90,
        estimatedRevenue: 280000,
        riskLevel: 'medium',
      },
    ];

    if (dto.budget && dto.budget < 20000) {
      return [cropDatabase[0], cropDatabase[4]].slice(0, 2);
    }

    if (dto.soilType === 'clay') {
      return [cropDatabase[1], cropDatabase[3]];
    }

    if (dto.soilType === 'sandy') {
      return [cropDatabase[0], cropDatabase[4], cropDatabase[5]];
    }

    return cropDatabase.slice(0, 3);
  }

  async getMarketInsights(dto: MarketInsightDto): Promise<MarketInsight[]> {
    // ─── Real integration point ───────────────────────────────────────────
    // Replace with actual market data aggregation and NLP summary generation
    // const insights = await this.marketDataService.getInsights(dto.region, dto.category);
    // ─────────────────────────────────────────────────────────────────────

    return [
      {
        summary:
          'Maize prices trending upward due to dry season supply constraints. Expect 10-15% increase over next 2 weeks.',
        commodity: 'maize',
        priceChange: '+12%',
        outlook: 'Supply shortage expected to push prices higher. Farmers holding stock anticipating better prices.',
      },
      {
        summary:
          'Tomato prices showing seasonal dip as harvest begins in northern states. Prices expected to normalize by mid-month.',
        commodity: 'tomato',
        priceChange: '-8%',
        outlook: 'Short-term oversupply. Good time for buyers to stock up.',
      },
      {
        summary:
          'Rice prices stable with slight upward pressure from increased paddy input costs. Local rice gaining preference over imported.',
        commodity: 'rice',
        priceChange: '+3%',
        outlook: 'Steady demand. Anchor borrower program supporting local production.',
      },
      {
        summary:
          'Cassava processing demand increasing as flour millers seek local substitutes. Root prices expected to firm.',
        commodity: 'cassava',
        priceChange: '+5%',
        outlook: 'Growing industrial demand supports price floor. New processing facilities opening in Oyo and Kwara states.',
      },
      {
        summary:
          'Soybean exports to EU increasing on back of depreciated naira. Domestic prices tracking export parity.',
        commodity: 'soybean',
        priceChange: '+7%',
        outlook: 'Export demand expected to remain strong through Q3.',
      },
    ];
  }

  async chatWithAssistant(
    dto: ChatMessageDto,
  ): Promise<ChatResponse> {
    const message = dto.message.toLowerCase();
    const lang = dto.language ?? 'en';

    // ─── Real integration point ──────────────────────────────────────────
    // Replace with RAG (Retrieval-Augmented Generation) or LLM API call
    // const response = await this.llmService.chat(message, lang);
    // ─────────────────────────────────────────────────────────────────────

    const faqResponses: Array<{ keywords: string[]; en: string; reply: string }> = [
      {
        keywords: ['fertilizer', 'npk', 'apply', 'nutrient'],
        en: 'For most crops, apply NPK 10-10-10 at planting (2 bags per hectare). Top-dress with urea (46-0-0) 4-6 weeks after planting at 1 bag per hectare. Always conduct a soil test first for precise recommendations.',
        reply: 'For most crops, apply NPK 10-10-10 at planting (2 bags per hectare). Top-dress with urea (46-0-0) 4-6 weeks after planting at 1 bag per hectare. Always conduct a soil test first for precise recommendations.',
      },
      {
        keywords: ['disease', 'blight', 'pest', 'fungicide', 'spray'],
        en: 'Early detection is key. Inspect your farm weekly. For fungal diseases, apply copper-based fungicides preventatively. For insect pests, identify the specific pest first — neem oil works well for aphids and caterpillars. Remove and destroy severely infected plants.',
        reply: 'Early detection is key. Inspect your farm weekly. For fungal diseases, apply copper-based fungicides preventatively. For insect pests, identify the specific pest first — neem oil works well for aphids and caterpillars. Remove and destroy severely infected plants.',
      },
      {
        keywords: ['planting', 'season', 'when', 'sow', 'time'],
        en: 'In southwest Nigeria, start planting when rains are well established (late May-June for maize, June-July for rice). Cassava can be planted April-June. Dry season farming requires irrigation. Check your local meteorological office for seasonal forecasts.',
        reply: 'In southwest Nigeria, start planting when rains are well established (late May-June for maize, June-July for rice). Cassava can be planted April-June. Dry season farming requires irrigation. Check your local meteorological office for seasonal forecasts.',
      },
      {
        keywords: ['price', 'market', 'sell', 'where', 'buyer'],
        en: 'GreenPurse connects you directly with verified buyers. Use the Markets section to list your produce. Prices are negotiable. We recommend listing 2-3 days before harvest so buyers can plan logistics. Our logistics partners can handle pickup from your farm.',
        reply: 'GreenPurse connects you directly with verified buyers. Use the Markets section to list your produce. Prices are negotiable. We recommend listing 2-3 days before harvest so buyers can plan logistics. Our logistics partners can handle pickup from your farm.',
      },
      {
        keywords: ['storage', 'post-harvest', 'loss', 'keep', 'preserve'],
        en: 'Post-harvest losses can reach 40% without proper storage. Key tips: (1) Dry produce to moisture content below 14% before storage. (2) Use Purdue Improved Crop Storage (PICS) bags for cowpea. (3) Store in cool, ventilated areas. (4) Consider our warehousing service for bulk storage.',
        reply: 'Post-harvest losses can reach 40% without proper storage. Key tips: (1) Dry produce to moisture content below 14% before storage. (2) Use Purdue Improved Crop Storage (PICS) bags for cowpea. (3) Store in cool, ventilated areas. (4) Consider our warehousing service for bulk storage.',
      },
      {
        keywords: ['loan', 'finance', 'capital', 'fund', 'credit'],
        en: 'GreenPurse partners with microfinance institutions for agricultural loans. Requirements: (1) Active farming account on our platform, (2) Farm registration, (3) 3 months of produce sales history. Loan amounts range from ₦50,000 to ₦2,000,000 with flexible repayment aligned to harvest cycles.',
        reply: 'GreenPurse partners with microfinance institutions for agricultural loans. Requirements: (1) Active farming account on our platform, (2) Farm registration, (3) 3 months of produce sales history. Loan amounts range from ₦50,000 to ₦2,000,000 with flexible repayment aligned to harvest cycles.',
      },
    ];

    const matched = faqResponses.find(faq =>
      faq.keywords.some(kw => message.includes(kw)),
    );

    return {
      reply: matched ? matched.reply : 'I can help with fertilizer application, disease management, planting schedules, market access, post-harvest storage, and financing options. Could you please rephrase your question with more specifics about what you need help with?',
      language: lang,
      keywords: matched?.keywords,
    };
  }
}