import { Group, SingleGroup } from "@/types/interfaces";
import { create } from "zustand";

// 2️⃣ — Définis la forme du store global
interface AppState {
  selectedSingleGroup: SingleGroup | null;
  selectedGroups: Group[];
  setSelectedSingleGroup: (SingleGroup: SingleGroup | null) => void;
  setSelectedGroups: (groups: Group[]) => void;
  reset: () => void;
}

// 3️⃣ — Crée le store
export const useAppStore = create<AppState>((set) => ({
  selectedSingleGroup: null,
  selectedGroups: [],
  setSelectedSingleGroup: (SingleGroup) => set({ selectedSingleGroup: SingleGroup }),
  setSelectedGroups: (groups) => set({ selectedGroups: groups }),
  reset: () => set({ selectedSingleGroup: null, selectedGroups: [] }),
}));

