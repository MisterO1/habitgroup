import { Group, Habit } from "@/types/interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AppState {
  userGroupsZus: Group[];
  userHabitsZus: Habit[];
  setUserGroupsZus: (groups: Group[]) => void;
  setUserHabitsZus: (habits: Habit[]) => void;
  reset: () => void;
}

export const useAppStore = create(
  persist<AppState>(
    (set) => ({
      userGroupsZus: [],
      userHabitsZus: [],
      setUserGroupsZus: (groups) => set({ userGroupsZus: groups }),
      setUserHabitsZus: (habits) => set({ userHabitsZus: habits }),
      reset: () =>
        set({
          userGroupsZus: [],
          userHabitsZus: [],
        }),
    }),
    {
      name: "ghabit-storage",// key for the storage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
