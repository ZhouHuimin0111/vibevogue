import Dexie, { type Table } from 'dexie';

export interface ClothingItem {
  id?: number;
  name: string;
  category: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory';
  imageData: string;
  createdAt: Date;
}

export interface UserPhoto {
  id?: number;
  type: 'model';
  imageData: string;
  createdAt: Date;
}

export interface TryOnResult {
  id?: number;
  modelId: number;
  clothingIds: number[];
  resultImageUrl: string;
  createdAt: Date;
}

export class VibevogueDB extends Dexie {
  clothing!: Table<ClothingItem>;
  userPhotos!: Table<UserPhoto>;
  tryOnResults!: Table<TryOnResult>;

  constructor() {
    super('vibevogue');
    this.version(1).stores({
      clothing: '++id, name, category, createdAt',
      userPhotos: '++id, type, createdAt',
      tryOnResults: '++id, modelId, createdAt',
    });
  }
}

export const db = new VibevogueDB();
