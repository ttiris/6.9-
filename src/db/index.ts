import Dexie, { type EntityTable } from 'dexie';
import type { Case, ExperienceUnit, Tag, ProjectBrief, User } from '../types';

class AppDatabase extends Dexie {
  cases!: EntityTable<Case, 'id'>;
  units!: EntityTable<ExperienceUnit, 'id'>;
  tags!: EntityTable<Tag, 'id'>;
  briefs!: EntityTable<ProjectBrief, 'id'>;
  users!: EntityTable<User, 'id'>;

  constructor() {
    super('MediaExperienceAssetsDB');
    this.version(3).stores({
      cases: 'id, category, status, createdAt, authorId',
      units: 'id, mediaType, difficulty, popularity, sourceCaseId, authorId',
      tags: 'id, category, usageCount',
      briefs: 'id, type, createdAt',
      users: 'id',
    });
  }
}

export const db = new AppDatabase();

// Helper: 初始化数据库（首次使用时调用）
export async function initDB(): Promise<void> {
  const count = await db.cases.count();
  if (count === 0) {
    console.log('[DB] 数据库已初始化，等待导入 Mock 数据...');
  }
}
