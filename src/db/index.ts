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
      wardrobe: '++id, name, category, mainColor, createdAt, updatedAt',
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
