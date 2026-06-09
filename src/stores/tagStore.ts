import { create } from 'zustand';
import type { Tag, TagCategory } from '../types';
import { db } from '../db';

interface TagStore {
  tags: Tag[];
  loading: boolean;
  loadTags: () => Promise<void>;
  addTag: (t: Tag) => Promise<void>;
  getTagsByCategory: (cat: TagCategory) => Tag[];
  getRelatedTags: (tagId: string) => Tag[];
}

export const useTagStore = create<TagStore>((set, get) => ({
  tags: [],
  loading: false,
  loadTags: async () => {
    set({ loading: true });
    const tags = await db.tags.toArray();
    set({ tags, loading: false });
  },
  addTag: async (t) => {
    await db.tags.put(t);
    set((s) => ({ tags: [...s.tags, t] }));
  },
  getTagsByCategory: (cat) => get().tags.filter((t) => t.category === cat),
  getRelatedTags: (tagId) => {
    const tag = get().tags.find((t) => t.id === tagId);
    if (!tag) return [];
    return get().tags.filter((t) => tag.relatedTags.includes(t.id));
  },
}));
