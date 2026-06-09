import { create } from 'zustand';
import type { Case, CaseStatus, MediaType } from '../types';
import { db } from '../db';

interface CaseStore {
  cases: Case[];
  loading: boolean;
  loadCases: () => Promise<void>;
  addCase: (c: Case) => Promise<void>;
  updateCase: (id: string, data: Partial<Case>) => Promise<void>;
  getCasesByStatus: (status: CaseStatus) => Case[];
  getCasesByType: (type: MediaType) => Case[];
}

export const useCaseStore = create<CaseStore>((set, get) => ({
  cases: [],
  loading: false,
  loadCases: async () => {
    set({ loading: true });
    const cases = await db.cases.toArray();
    set({ cases, loading: false });
  },
  addCase: async (c) => {
    await db.cases.put(c);
    set((s) => ({ cases: [...s.cases, c] }));
  },
  updateCase: async (id, data) => {
    await db.cases.update(id, data);
    set((s) => ({
      cases: s.cases.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
  },
  getCasesByStatus: (status) => get().cases.filter((c) => c.status === status),
  getCasesByType: (type) => get().cases.filter((c) => c.category === type),
}));
