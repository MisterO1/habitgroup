import { Group, Habit, SingleGroup } from "@/types/interfaces";
import { create } from "zustand";

// 2️⃣ — Définis la forme du store global
interface AppState {
  userSingleGroupZus: SingleGroup | null;
  userGroupsZus: Group[];
  userHabitsZus: Habit[];
  setUserSingleGroupZus: (SingleGroup: SingleGroup | null) => void;
  setUserGroupsZus: (groups: Group[]) => void;
  setUserHabitsZus: (habits: Habit[]) => void;
  reset: () => void;
}

// 3️⃣ — Crée le store
export const useAppStore = create<AppState>((set) => ({
  userSingleGroupZus: null,
  userGroupsZus: [],
  userHabitsZus: [],
  setUserSingleGroupZus: (SingleGroup) => set({ userSingleGroupZus: SingleGroup }),
  setUserGroupsZus: (groups) => set({ userGroupsZus: groups }),
  setUserHabitsZus: (habits) => set({ userHabitsZus: habits}),
  reset: () => set({ 
    userSingleGroupZus: null, 
    userGroupsZus: [],
    userHabitsZus: [],
  }),
}));

