import Dexie, { type Table } from 'dexie';
import type {
  WardrobeItem,
  UserPhoto,
  OutfitRecord,
  GarmentCategory,
  Season,
  StyleTag,
} from '../types';

export class VibevogueDB extends Dexie {
  wardrobe!: Table<WardrobeItem>;
  userPhotos!: Table<UserPhoto>;
  outfits!: Table<OutfitRecord>;

  constructor() {
    super('vibevogue');

    this.version(1).stores({
      wardrobe: '++id, name, category, mainColor, utilizationCount, dateAdded, createdAt, updatedAt',
      userPhotos: '++id, type, createdAt',
      outfits: '++id, name, weatherCondition, createdAt',
    });
  }
}

export const db = new VibevogueDB();

// Database helper functions
export async function addWardrobeItem(
  name: string,
  imageData: string,
  category: GarmentCategory,
  mainColor: string,
  seasons: Season[],
  styleTags: StyleTag[]
): Promise<number> {
  return db.wardrobe.add({
    name,
    imageData,
    category,
    mainColor,
    seasons,
    styleTags,
    utilizationCount: 0,
    dateAdded: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function getWardrobeItems(): Promise<WardrobeItem[]> {
  return db.wardrobe.orderBy('createdAt').reverse().toArray();
}

export async function getWardrobeItemsByCategory(
  category: GarmentCategory
): Promise<WardrobeItem[]> {
  return db.wardrobe.where('category').equals(category).toArray();
}

export async function getWardrobeItemsBySeason(season: Season): Promise<WardrobeItem[]> {
  return db.wardrobe.filter(item => item.seasons.includes(season)).toArray();
}

export async function deleteWardrobeItem(id: number): Promise<void> {
  await db.wardrobe.delete(id);
}

export async function updateWardrobeItem(
  id: number,
  updates: Partial<Omit<WardrobeItem, 'id' | 'createdAt'>>
): Promise<void> {
  await db.wardrobe.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

export async function incrementUtilizationCount(id: number): Promise<void> {
  await db.wardrobe.update(id, {
    utilizationCount: (await db.wardrobe.get(id))?.utilizationCount ?? 0 + 1,
    updatedAt: new Date(),
  });
}

export async function getTopUtilizedItems(limit: number = 3): Promise<WardrobeItem[]> {
  return db.wardrobe.orderBy('utilizationCount').reverse().limit(limit).toArray();
}

export interface WardrobeStats {
  totalItems: number;
  categoryBreakdown: Record<GarmentCategory, number>;
  topUtilized: WardrobeItem[];
}

export async function getWardrobeStats(): Promise<WardrobeStats> {
  const items = await db.wardrobe.toArray();
  const categoryBreakdown: Record<GarmentCategory, number> = {
    'Top': 0,
    'Bottom': 0,
    'Dress': 0,
    'Shoes': 0,
    'Outerwear': 0,
    'Accessory': 0,
  };

  items.forEach(item => {
    categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
  });

  const topUtilized = items
    .sort((a, b) => b.utilizationCount - a.utilizationCount)
    .slice(0, 3);

  return {
    totalItems: items.length,
    categoryBreakdown,
    topUtilized,
  };
}

export async function saveModelPhoto(imageData: string): Promise<number> {
  const existing = await db.userPhotos.where('type').equals('model').first();
  if (existing) {
    await db.userPhotos.update(existing.id!, { imageData });
    return existing.id!;
  }
  return db.userPhotos.add({
    type: 'model',
    imageData,
    createdAt: new Date(),
  });
}

export async function getModelPhoto(): Promise<UserPhoto | undefined> {
  return db.userPhotos.where('type').equals('model').first();
}

export async function saveOutfitRecord(
  name: string,
  itemIds: number[],
  weatherCondition: string,
  reasoning: string,
  colorLogic: string,
  styleAnalysis: string,
  tryOnImageUrl?: string
): Promise<number> {
  return db.outfits.add({
    name,
    itemIds,
    weatherCondition,
    reasoning,
    colorLogic,
    styleAnalysis,
    tryOnImageUrl,
    createdAt: new Date(),
  });
}

export async function getOutfitRecords(): Promise<OutfitRecord[]> {
  return db.outfits.orderBy('createdAt').reverse().toArray();
}

export async function deleteOutfitRecord(id: number): Promise<void> {
  await db.outfits.delete(id);
}

// Demo data seeding with proper type annotations
const DEMO_WARDROBE_ITEMS: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt' | 'utilizationCount' | 'dateAdded'>[] = [
  {
    name: '蕾丝连衣裙',
    imageData: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
    category: 'Dress',
    mainColor: '#E8D5C4',
    seasons: ['Spring', 'Summer'],
    styleTags: ['Romantic', 'Classic'],
  },
  {
    name: '真丝衬衫',
    imageData: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&h=600&fit=crop',
    category: 'Top',
    mainColor: '#F5F0E8',
    seasons: ['Spring', 'Autumn'],
    styleTags: ['Classic', 'Formal'],
  },
  {
    name: '高腰阔腿裤',
    imageData: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=600&fit=crop',
    category: 'Bottom',
    mainColor: '#2C3E50',
    seasons: ['Spring', 'Summer', 'Autumn'],
    styleTags: ['Minimalist', 'Formal'],
  },
  {
    name: '针织开衫',
    imageData: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop',
    category: 'Outerwear',
    mainColor: '#D4A574',
    seasons: ['Spring', 'Autumn', 'Winter'],
    styleTags: ['Casual', 'Classic'],
  },
  {
    name: '波点半身裙',
    imageData: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aeab?w=400&h=600&fit=crop',
    category: 'Bottom',
    mainColor: '#1A1A2E',
    seasons: ['Spring', 'Summer'],
    styleTags: ['Vintage', 'Romantic'],
  },
  {
    name: '缎面吊带裙',
    imageData: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=600&fit=crop',
    category: 'Dress',
    mainColor: '#C9A87C',
    seasons: ['Summer'],
    styleTags: ['Formal', 'Romantic'],
  },
  {
    name: '刺绣上衣',
    imageData: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&h=600&fit=crop',
    category: 'Top',
    mainColor: '#F0E6D3',
    seasons: ['Spring', 'Summer'],
    styleTags: ['Bohemian', 'Romantic'],
  },
  {
    name: '羊绒大衣',
    imageData: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=600&fit=crop',
    category: 'Outerwear',
    mainColor: '#8B7355',
    seasons: ['Autumn', 'Winter'],
    styleTags: ['Classic', 'Formal'],
  },
];

const DEMO_OUTFIT_RECORDS: Omit<OutfitRecord, 'id' | 'createdAt'>[] = [
  {
    name: '春日花园穿搭',
    itemIds: [1, 2],
    weatherCondition: 'sunny',
    reasoning: '轻盈的蕾丝裙搭配真丝衬衫，呈现春日优雅氛围',
    colorLogic: '米白色系协调搭配，金色配饰点缀',
    styleAnalysis: '浪漫优雅风格，适合午后花园茶会',
    tryOnImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=750&fit=crop',
  },
  {
    name: '都市通勤搭配',
    itemIds: [2, 3],
    weatherCondition: 'cloudy',
    reasoning: '真丝衬衫搭配高腰阔腿裤，干练利落',
    colorLogic: '深蓝与米白对比，层次分明',
    styleAnalysis: '都市职业风格，低调专业',
    tryOnImageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=750&fit=crop',
  },
  {
    name: '秋日暖意穿搭',
    itemIds: [4, 5],
    weatherCondition: 'sunny',
    reasoning: '针织开衫叠穿波点裙，温暖又有层次',
    colorLogic: '大地色系与经典波点碰撞',
    styleAnalysis: '复古文艺风格，秋日漫步首选',
    tryOnImageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&h=750&fit=crop',
  },
];

export async function seedDemoData(): Promise<void> {
  const wardrobeCount = await db.wardrobe.count();
  const outfitCount = await db.outfits.count();

  if (wardrobeCount === 0) {
    const itemsWithTimestamp = DEMO_WARDROBE_ITEMS.map((item, index) => ({
      ...item,
      utilizationCount: Math.floor(Math.random() * 5),
      dateAdded: new Date(Date.now() - (index * 86400000)),
      createdAt: new Date(Date.now() - (index * 86400000)),
      updatedAt: new Date(),
    }));
    await db.wardrobe.bulkAdd(itemsWithTimestamp);
  }

  if (outfitCount === 0) {
    const recordsWithTimestamp = DEMO_OUTFIT_RECORDS.map((record) => ({
      ...record,
      createdAt: new Date(),
    }));
    await db.outfits.bulkAdd(recordsWithTimestamp);
  }
}

export async function checkAndSeedDemoData(): Promise<void> {
  const wardrobeCount = await db.wardrobe.count();
  const outfitCount = await db.outfits.count();

  if (wardrobeCount === 0 || outfitCount === 0) {
    await seedDemoData();
  }
}
