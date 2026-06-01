/**
 * AI Service Layer
 * Core business logic for garment analysis, outfit generation, and virtual try-on
 */

import { fal } from '@fal-ai/client';
import OpenAI from 'openai';
import type {
  GarmentAnalysis,
  WardrobeItem,
  OutfitSuggestion,
  TryOnResult,
  AIRecommendationResult,
  OutfitRecommendation,
  UserProfile,
  WeatherType,
} from '../types';
import { addWardrobeItem, saveOutfitRecord } from '../db';

// Initialize Fal.ai client
fal.config({
  credentials: import.meta.env.VITE_FAL_KEY,
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_KEY,
  dangerouslyAllowBrowser: true,
});

// ============================================================================
// System Prompts
// ============================================================================

const GARMENT_ANALYSIS_PROMPT = `You are a fashion archive AI curator. Analyze the garment in the image.

You MUST respond with ONLY a valid JSON object in this exact format, no other text:
{
  "category": "Top" | "Bottom" | "Dress" | "Shoes" | "Outerwear" | "Accessory",
  "mainColor": "primary color name in English",
  "seasons": ["Spring", "Summer", "Autumn", "Winter"] as applicable,
  "styleTags": ["Minimalist", "Vintage", "Streetwear", "Bohemian", "Formal", "Casual", "Sporty", "Romantic", "Avant-garde", "Classic"] as applicable,
  "name": "an elegant, descriptive name for this garment"
}`;

const OUTFIT_GENERATION_PROMPT = `你是一位专业的时尚造型师。请基于用户的肤色与身型特征，结合当天天气，从提供的衣柜单品池中，通过色彩协调度与风格分析，生成3套不同的穿搭方案。

严格以JSON数组格式返回，每套方案需包含：top(上装ID)、bottom(下装ID)、shoes(鞋子ID)、reason(基于色彩和身型的搭配核心理由，使用简体中文)。

肤色映射：
- fair(白皙): 适合冷色调，如浅蓝、淡紫、粉色系
- light(浅色): 适合柔和色调，如米色、浅灰、淡粉
- medium(中等): 适合中性色调，如橄榄绿、焦糖色、砖红
- tan(偏深): 适合暖色调，如金色、橙色、深蓝
- dark(深色): 适合饱和度高的颜色，如宝蓝、正红、金色

身型建议：
- hourglass(沙漏型): 强调腰线，推荐收腰剪裁
- pear(梨型): 上装突出肩线，下装深色显瘦
- apple(苹果型): 上装宽松遮盖，下装简洁利落
- rectangle(直筒型): 层叠搭配制造曲线
- inverted-triangle(倒三角): 下装亮色平衡上身

天气适配：
- sunny/clear: 轻盈面料，明亮色彩
- cloudy: 层次叠穿，适中厚度
- rainy: 防风外套，深色系为主

返回格式示例：
{
  "recommendations": [
    {
      "top": 1,
      "bottom": 3,
      "shoes": 5,
      "dress": null,
      "outerwear": null,
      "accessory": null,
      "reason": "该搭配基于您的沙漏型身型，选择收腰设计凸显曲线..."
    }
  ]
}`;

const LEGACY_OUTFIT_GENERATION_PROMPT = `You are a strict senior fashion director. Select items from the user's inventory to create an outfit.

Rules:
- Must be appropriate for the current weather and temperature
- Follow the "three-piece rule" or "sandwich color matching"
- Ensure visual balance (e.g., fitted top with loose bottom)
- Prioritize versatile, timeless combinations

Return ONLY a valid JSON object in this exact format:
{
  "reasoning": "Detailed reasoning for the outfit choice in Chinese",
  "colorLogic": "Color matching explanation in Chinese",
  "styleAnalysis": "Style and mood analysis in Chinese",
  "selectedItems": [array of wardrobe item IDs]
}`;

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Analyze garment image using vision model
 * @param imageBase64 - Base64 encoded image data
 * @returns Parsed garment analysis result
 */
export async function analyzeGarment(imageBase64: string): Promise<GarmentAnalysis> {
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: GARMENT_ANALYSIS_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No analysis result received from AI');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const analysis = JSON.parse(jsonMatch[0]) as GarmentAnalysis;

    // Validate and normalize the response
    const validatedAnalysis: GarmentAnalysis = {
      category: analysis.category || 'Top',
      mainColor: analysis.mainColor || 'Unknown',
      seasons: Array.isArray(analysis.seasons) ? analysis.seasons : ['Spring', 'Autumn'],
      styleTags: Array.isArray(analysis.styleTags) ? analysis.styleTags : ['Casual'],
      name: analysis.name || 'Unnamed Garment',
    };

    // Save to database
    await addWardrobeItem(
      validatedAnalysis.name,
      imageBase64,
      validatedAnalysis.category,
      validatedAnalysis.mainColor,
      validatedAnalysis.seasons,
      validatedAnalysis.styleTags
    );

    return validatedAnalysis;
  } catch (error) {
    console.error('Garment analysis error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to analyze garment'
    );
  }
}

/**
 * Generate AI-powered outfit recommendations
 * @param userProfile - User skin tone and body shape
 * @param weather - Current weather condition
 * @param wardrobeData - Full wardrobe inventory
 * @returns Array of outfit recommendations
 */
export async function generateOutfit(
  userProfile: UserProfile,
  weather: WeatherType,
  wardrobeData: WardrobeItem[]
): Promise<AIRecommendationResult> {
  try {
    const wardrobeJson = JSON.stringify(
      wardrobeData.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        color: item.mainColor,
        colorHex: item.mainColor,
        seasons: item.seasons,
        styles: item.styleTags,
      }))
    );

    const skinToneMap: Record<string, string> = {
      fair: '白皙',
      light: '浅色',
      medium: '中等',
      tan: '偏深',
      dark: '深色',
    };

    const bodyShapeMap: Record<string, string> = {
      hourglass: '沙漏型',
      pear: '梨型',
      apple: '苹果型',
      rectangle: '直筒型',
      'inverted-triangle': '倒三角',
    };

    const weatherMap: Record<WeatherType, string> = {
      sunny: '晴天',
      cloudy: '多云',
      rainy: '雨天',
      clear: '晴朗',
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: OUTFIT_GENERATION_PROMPT,
        },
        {
          role: 'user',
          content: `用户特征：
- 肤色：${skinToneMap[userProfile.skinTone]} (${userProfile.skinTone})
- 身型：${bodyShapeMap[userProfile.bodyShape]} (${userProfile.bodyShape})

当前天气：${weatherMap[weather]} (${weather})

衣柜单品池：
${wardrobeJson}`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No outfit recommendation received from AI');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const result = JSON.parse(jsonMatch[0]) as AIRecommendationResult;

    // Validate and normalize recommendations
    const validatedResult: AIRecommendationResult = {
      recommendations: result.recommendations?.map((rec: OutfitRecommendation) => ({
        top: rec.top ?? null,
        bottom: rec.bottom ?? null,
        dress: rec.dress ?? null,
        shoes: rec.shoes ?? null,
        outerwear: rec.outerwear ?? null,
        accessory: rec.accessory ?? null,
        reason: rec.reason || '无详细说明',
      })) || [],
    };

    // Save outfit records for each recommendation
    for (const rec of validatedResult.recommendations) {
      const itemIds = [rec.top, rec.bottom, rec.dress, rec.shoes, rec.outerwear, rec.accessory]
        .filter((id): id is number => id !== null)
        .map(id => id!);

      if (itemIds.length > 0) {
        await saveOutfitRecord(
          `AI推荐穿搭 ${new Date().toLocaleDateString('zh-CN')}`,
          itemIds,
          weather,
          rec.reason,
          '',
          '',
          undefined
        );
      }
    }

    return validatedResult;
  } catch (error) {
    console.error('Outfit generation error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to generate outfit recommendation'
    );
  }
}

/**
 * Generate outfit suggestion (legacy function for backward compatibility)
 * @param weatherCondition - Current weather description
 * @param userInventory - Array of wardrobe items
 * @returns Structured outfit suggestion
 */
export async function generateLegacyOutfit(
  weatherCondition: string,
  userInventory: WardrobeItem[]
): Promise<OutfitSuggestion> {
  try {
    const inventoryJson = JSON.stringify(
      userInventory.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        color: item.mainColor,
        seasons: item.seasons,
        styles: item.styleTags,
      }))
    );

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: LEGACY_OUTFIT_GENERATION_PROMPT,
        },
        {
          role: 'user',
          content: `Current weather: ${weatherCondition}\n\nUser wardrobe inventory:\n${inventoryJson}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No outfit suggestion received from AI');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const suggestion = JSON.parse(jsonMatch[0]) as OutfitSuggestion;

    // Save outfit record
    await saveOutfitRecord(
      `Outfit ${new Date().toLocaleDateString('zh-CN')}`,
      suggestion.selectedItems || [],
      weatherCondition,
      suggestion.reasoning || '',
      suggestion.colorLogic || '',
      suggestion.styleAnalysis || ''
    );

    return {
      reasoning: suggestion.reasoning || 'No reasoning provided',
      colorLogic: suggestion.colorLogic || 'No color logic provided',
      styleAnalysis: suggestion.styleAnalysis || 'No style analysis provided',
      selectedItems: suggestion.selectedItems || [],
    };
  } catch (error) {
    console.error('Outfit generation error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to generate outfit'
    );
  }
}

/**
 * Generate virtual try-on using Fal.ai IDM-VTON
 * @param humanImage - Base64 encoded human/model image
 * @param garmentImage - Base64 encoded garment image
 * @returns Try-on result with generated image URL
 */
export async function virtualTryOn(
  humanImage: string,
  garmentImage: string
): Promise<TryOnResult> {
  const falKey = import.meta.env.VITE_FAL_KEY;

  // Check if API is configured properly
  if (!falKey || falKey === '' || falKey.includes('your-')) {
    console.log('[VibeVogue] Fal.ai API not configured, using demo mode');
    return createSimulatedTryOn(humanImage, garmentImage);
  }

  console.log('[VibeVogue] Using Fal.ai API for virtual try-on');

  try {
    console.log('[VibeVogue] Calling fal.subscribe...');

    const result = await fal.subscribe('fal-ai/idm-vton', {
      input: {
        human_image: humanImage,
        garm_img: garmentImage,
        garment_description: 'tops',
      },
      logs: true,
    });

    console.log('[VibeVogue] Fal.ai response:', result);

    // Handle different return types from Fal.ai
    let imageUrl = '';

    // Try different response structures
    if (result && typeof result === 'object') {
      const resultObj = result as Record<string, unknown>;

      // Structure 1: { image: { url: string } }
      if (resultObj.image && typeof resultObj.image === 'object') {
        imageUrl = (resultObj.image as Record<string, unknown>).url as string;
      }
      // Structure 2: { images: [{ url: string }] }
      else if (resultObj.images && Array.isArray(resultObj.images)) {
        imageUrl = (resultObj.images[0] as Record<string, unknown>)?.url as string;
      }
      // Structure 3: Direct URL
      else if (resultObj.url) {
        imageUrl = resultObj.url as string;
      }
      // Structure 4: String result
      else if (typeof result === 'string') {
        imageUrl = result;
      }
    }

    console.log('[VibeVogue] Extracted image URL:', imageUrl);

    if (!imageUrl || imageUrl === '[object Object]') {
      console.error('[VibeVogue] Invalid response structure from Fal.ai');
      throw new Error('Invalid response from try-on service');
    }

    return { imageUrl };
  } catch (error) {
    console.error('[VibeVogue] Virtual try-on error:', error);
    console.log('[VibeVogue] Falling back to demo mode');

    // Fallback to simulation if API fails
    return createSimulatedTryOn(humanImage, garmentImage);
  }
}

/**
 * Creates a simulated try-on result by overlaying garment on model
 */
async function createSimulatedTryOn(
  humanImage: string,
  garmentImage: string
): Promise<TryOnResult> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      // Fallback to garment image
      resolve({ imageUrl: garmentImage });
      return;
    }

    const img1 = new Image();
    const img2 = new Image();

    img1.crossOrigin = 'anonymous';
    img2.crossOrigin = 'anonymous';

    img1.onload = () => {
      img2.onload = () => {
        // Set canvas size based on model image
        canvas.width = img1.width;
        canvas.height = img1.height;

        // Draw model image
        ctx.drawImage(img1, 0, 0);

        // Draw garment image at top-center with transparency
        const garmentWidth = img1.width * 0.5;
        const garmentHeight = (garmentWidth / img2.width) * img2.height;
        const x = (img1.width - garmentWidth) / 2;
        const y = img1.height * 0.15;

        ctx.globalAlpha = 0.85;
        ctx.drawImage(img2, x, y, garmentWidth, garmentHeight);
        ctx.globalAlpha = 1.0;

        // Add a subtle border/frame
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

        const resultUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve({ imageUrl: resultUrl });
      };

      img2.onerror = () => {
        resolve({ imageUrl: humanImage });
      };

      img2.src = garmentImage;
    };

    img1.onerror = () => {
      resolve({ imageUrl: garmentImage });
    };

    img1.src = humanImage;
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if AI services are properly configured
 */
export function isServiceConfigured(): {
  falConfigured: boolean;
  openaiConfigured: boolean;
} {
  return {
    falConfigured: Boolean(import.meta.env.VITE_FAL_KEY),
    openaiConfigured: Boolean(import.meta.env.VITE_OPENAI_KEY),
  };
}
