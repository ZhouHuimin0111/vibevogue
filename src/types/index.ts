// Garment Types
export type GarmentCategory =
  | 'Top'
  | 'Bottom'
  | 'Dress'
  | 'Shoes'
  | 'Outerwear'
  | 'Accessory';

export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export type StyleTag =
  | 'Minimalist'
  | 'Vintage'
  | 'Streetwear'
  | 'Bohemian'
  | 'Formal'
  | 'Casual'
  | 'Sporty'
  | 'Romantic'
  | 'Avant-garde'
  | 'Classic';

export interface GarmentAnalysis {
  category: GarmentCategory;
  mainColor: string;
  seasons: Season[];
  styleTags: StyleTag[];
  name: string;
}

// Wardrobe Item (from database)
export interface WardrobeItem {
  id?: number;
  name: string;
  imageData: string;
  category: GarmentCategory;
  mainColor: string;
  seasons: Season[];
  styleTags: StyleTag[];
  utilizationCount: number;
  dateAdded: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User Profile Photo
export interface UserPhoto {
  id?: number;
  type: 'model';
  imageData: string;
  createdAt: Date;
}

// User Profile for AI Recommendations
export interface UserProfile {
  skinTone: SkinTone;
  bodyShape: BodyShape;
  mbti?: string;
  stylePersona?: string;
  avatarImage?: string;
}

export interface ExtendedUserProfile extends UserProfile {
  mood?: string;
}

export type SkinTone = 'fair' | 'light' | 'medium' | 'tan' | 'dark';

export type BodyShape = 'hourglass' | 'pear' | 'apple' | 'rectangle' | 'inverted-triangle';

// Outfit Record
export interface OutfitRecord {
  id?: number;
  name: string;
  itemIds: number[];
  weatherCondition: string;
  reasoning: string;
  colorLogic: string;
  styleAnalysis: string;
  tryOnImageUrl?: string;
  createdAt: Date;
}

// Weather Condition
export interface WeatherCondition {
  temperature: number;
  weather: string;
  humidity: number;
  windSpeed: number;
}

// AI Recommendation Types
export interface OutfitRecommendation {
  top: number | null;
  bottom: number | null;
  dress: number | null;
  shoes: number | null;
  outerwear: number | null;
  accessory: number | null;
  reason: string;
}

export interface AIRecommendationResult {
  recommendations: OutfitRecommendation[];
}

// AI Service Response Types
export interface OutfitSuggestion {
  reasoning: string;
  colorLogic: string;
  styleAnalysis: string;
  selectedItems: number[];
}

export interface TryOnResult {
  imageUrl: string;
}

// Weather Type
export type WeatherType = 'sunny' | 'rainy' | 'cloudy' | 'clear';
