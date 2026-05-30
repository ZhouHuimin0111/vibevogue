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

const OUTFIT_GENERATION_PROMPT = `You are a strict senior fashion director. Select items from the user's inventory to create an outfit.

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
 * Generate outfit suggestion based on weather and user inventory
 * @param weatherCondition - Current weather description
 * @param userInventory - Array of wardrobe items
 * @returns Structured outfit suggestion
 */
export async function generateOutfit(
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
          content: OUTFIT_GENERATION_PROMPT,
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
  try {
    const result = await fal.subscribe('fal-ai/idm-vton', {
      input: {
        human_image: humanImage,
        garm_img: garmentImage,
        garment_description: 'tops',
      },
      logs: false,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log('Try-on processing:', update.logs);
        }
      },
    });

    // Handle different return types from Fal.ai
    const imageUrl =
      (result as unknown as { image?: { url: string } })?.image?.url ||
      (result as unknown as { images?: Array<{ url: string }> })?.images?.[0]?.url ||
      String(result);

    if (!imageUrl || imageUrl === '[object Object]') {
      throw new Error('Invalid response from try-on service');
    }

    return { imageUrl };
  } catch (error) {
    console.error('Virtual try-on error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to generate try-on'
    );
  }
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
