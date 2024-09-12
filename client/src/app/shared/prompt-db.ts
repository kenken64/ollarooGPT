import Dexie, { Table } from 'dexie';

export interface PromptItem {
    id?:number;
    email?: string;
    prompt: string;
    postedDate: Date;
}

export class AppDB extends Dexie {
  promptItems!: Table<PromptItem, number>;
  
  constructor() {
    super('nusiss-gpt');
    this.version(1).stores({
      promptItems: '++id, email',
    });
  }

  async addPromptItem(item: PromptItem) {
    const todoListId = await db.promptItems.add(item);
  }
}

export const db = new AppDB();