import { create } from 'zustand';
import type { ExperienceUnit, MediaType } from '../types';
import { db } from '../db';

interface UnitStore {
  units: ExperienceUnit[];
  loading: boolean;
  loadUnits: () => Promise<void>;
  addUnit: (u: ExperienceUnit) => Promise<void>;
  updateUnit: (id: string, data: Partial<ExperienceUnit>) => Promise<void>;
  getUnitsByType: (type: MediaType) => ExperienceUnit[];
  getTopUnits: (n: number) => ExperienceUnit[];
  toggleFavorite: (id: string) => Promise<void>;
}

export const useUnitStore = create<UnitStore>((set, get) => ({
  units: [],
  loading: false,
  loadUnits: async () => {
    set({ loading: true });
    const units = await db.units.toArray();
    set({ units, loading: false });
  },
  addUnit: async (u) => {
    await db.units.put(u);
    set((s) => ({ units: [...s.units, u] }));
  },
  updateUnit: async (id, data) => {
    await db.units.update(id, data);
    set((s) => ({
      units: s.units.map((u) => (u.id === id ? { ...u, ...data } : u)),
    }));
  },
  getUnitsByType: (type) => get().units.filter((u) => u.mediaType === type),
  getTopUnits: (n) =>
    [...get().units].sort((a, b) => b.popularity - a.popularity).slice(0, n),
  toggleFavorite: async (id) => {
    const unit = get().units.find((u) => u.id === id);
    if (!unit) return;
    const newFav = unit.favorites + (unit.favorites > 0 ? -1 : 1);
    await db.units.update(id, { favorites: newFav });
    set((s) => ({
      units: s.units.map((u) => (u.id === id ? { ...u, favorites: newFav } : u)),
    }));
  },
}));
