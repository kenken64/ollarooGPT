import Dexie, { Table } from 'dexie';

export interface PromptItem {
  id?:number;
  email?: string;
  prompt: string;
  postedDate: Date;
}

export interface AuthToken {
  id?:number;
  token?: string;
}

export class AppDB extends Dexie {
  promptItems!: Table<PromptItem, number>;
  tokensTable!: Table<AuthToken, string>;
  constructor() {
    super('ollaroo');
    this.version(2).stores({
      promptItems: '++id, email',
      tokensTable: '++id, token',
    });
  }

  async addPromptItem(item: PromptItem) {
    const promptListId = await db.promptItems.add(item);
    console.log(promptListId)
  }

  async addAuthToken(authItem: AuthToken) {
    const authTokenId = await db.tokensTable.add(authItem);
    console.log(authTokenId);
  }

  async getAuthToken(): Promise<string| undefined>{
    const all = await db.tokensTable.toArray();
    console.log(all[0].token)
    return all[0].token;
  }

  async clearAuthToken(){
    await db.tokensTable.clear();
  }
}

export const db = new AppDB();