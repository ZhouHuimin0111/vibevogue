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
