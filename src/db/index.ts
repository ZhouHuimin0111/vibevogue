import Dexie, { type Table } from 'dexie';

export interface Todo {
  id?: number;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class VibevogueDB extends Dexie {
  todos!: Table<Todo>;

  constructor() {
    super('vibevogue');
    this.version(1).stores({
      todos: '++id, title, completed, createdAt, updatedAt',
    });
  }
}

export const db = new VibevogueDB();
